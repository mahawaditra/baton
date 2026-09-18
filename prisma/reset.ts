import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as XLSX from "xlsx/xlsx.mjs";
import * as fs from "fs";

XLSX.set_fs(fs);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CONDITIONS = ["ok", "need_repair", "retired", "lost"];
const STATUSES = ["available", "reserved", "borrowed", "placed", "unavailable"];

function assertSeedFile(
  path: string,
  requiredHeaders: string[],
  allowedValues: Record<string, string[]> = {},
  numericColumns: string[] = [],
  requiredCells: string[] = [],
) {
  if (!fs.existsSync(path)) {
    throw new Error(`Seed file not found: ${path}. Nothing was deleted.`);
  }
  const workbook = XLSX.readFile(path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const headerRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
  const headers = (headerRows[0] ?? []).map((h) => String(h).trim());
  const missing = requiredHeaders.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    throw new Error(
      `${path} is missing column(s): ${missing.join(", ")}. Nothing was deleted.`,
    );
  }
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  if (rows.length === 0) {
    throw new Error(`${path} has no data rows. Nothing was deleted.`);
  }

  const problems: string[] = [];
  rows.forEach((row, i) => {
    const excelRow = i + 2;
    for (const column of requiredCells) {
      const value = row[column];
      if (value === undefined || value === null || String(value).trim() === "") {
        problems.push(`row ${excelRow}, ${column} is required but blank`);
      }
    }
    for (const [column, allowed] of Object.entries(allowedValues)) {
      const value = row[column];
      if (value !== undefined && value !== null && !allowed.includes(String(value))) {
        problems.push(
          `row ${excelRow}, ${column} = "${value}" (allowed: ${allowed.join(", ")}, or blank)`,
        );
      }
    }
    for (const column of numericColumns) {
      const value = row[column];
      if (value !== undefined && value !== null && typeof value !== "number") {
        problems.push(`row ${excelRow}, ${column} = "${value}" (must be a number, or blank)`);
      }
    }
  });
  if (problems.length > 0) {
    const shown = problems.slice(0, 8).map((p) => `  - ${p}`).join("\n");
    const more = problems.length > 8 ? `\n  ...and ${problems.length - 8} more` : "";
    throw new Error(`${path} has invalid values:\n${shown}${more}\nNothing was deleted.`);
  }
}

async function main() {
  assertSeedFile(
    "prisma/seed-data/instruments.xlsx",
    ["Section", "Type", "Condition", "Location"],
    { Condition: CONDITIONS, Status: STATUSES },
    [],
    ["Section", "Type"],
  );
  assertSeedFile(
    "prisma/seed-data/goods.xlsx",
    ["Name", "Quantity", "Location"],
    { Condition: CONDITIONS },
    ["Quantity"],
    ["Name"],
  );

  const superAdmins = await prisma.admin.findMany({
    where: { role: "super_admin" },
    select: { id: true, email: true },
  });

  if (superAdmins.length === 0) {
    throw new Error(
      "No super_admin found. Refusing to reset: nobody could log in afterwards.",
    );
  }
  const superAdminIds = superAdmins.map((a) => a.id);

  const counts = {
    "borrowing requests (+ periods, documents, addendums)":
      await prisma.borrowingRequest.count(),
    "activity logs": await prisma.activityLog.count(),
    "inventory snapshots": await prisma.inventorySnapshot.count(),
    "annual reports": await prisma.annualReport.count(),
    "instrument type slots": await prisma.instrumentTypeSlot.count(),
    instruments: await prisma.instrument.count(),
    goods: await prisma.good.count(),
    "non-super admins": await prisma.admin.count({
      where: { id: { notIn: superAdminIds } },
    }),
  };

  const host = new URL(process.env.DATABASE_URL!).host;
  console.log(`\nDatabase: ${host}\n`);
  console.log("Will DELETE:");
  for (const [label, count] of Object.entries(counts)) {
    console.log(`  ${String(count).padStart(5)}  ${label}`);
  }
  console.log("\nWill KEEP (untouched, except email_verified/is_active set to true):");
  for (const admin of superAdmins) console.log(`  super_admin  ${admin.email}`);
  console.log("  loan settings (bank, deposit, signatory, LINE/WhatsApp toggles)\n");

  if (!process.stdin.isTTY) {
    console.log("Not an interactive terminal, nothing was deleted.");
    process.exitCode = 1;
    return;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Type RESET to continue: ");
  rl.close();
  if (answer.trim() !== "RESET") {
    console.log("Cancelled, nothing was deleted.");
    process.exitCode = 1;
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.borrowingRequest.deleteMany({});
    await tx.activityLog.deleteMany({});
    await tx.inventorySnapshot.deleteMany({});
    await tx.annualReport.deleteMany({});
    await tx.instrumentTypeSlot.deleteMany({});
    await tx.loanSetting.updateMany({
      where: {
        AND: [{ updatedBy: { not: null } }, { updatedBy: { notIn: superAdminIds } }],
      },
      data: { updatedBy: null },
    });
    await tx.instrument.deleteMany({});
    await tx.good.deleteMany({});
    await tx.admin.deleteMany({ where: { id: { notIn: superAdminIds } } });
    await tx.admin.updateMany({
      where: { id: { in: superAdminIds } },
      data: { emailVerified: true, isActive: true },
    });
  }, { timeout: 30_000, maxWait: 10_000 });

  console.log("\nReset done. Seeding instruments and goods next...\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
