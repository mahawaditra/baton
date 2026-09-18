import "dotenv/config";
import {
  PrismaClient,
  ItemCondition,
  InstrumentStatus,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as XLSX from "xlsx/xlsx.mjs";
import * as fs from "fs";
import { requiredText, text } from "./seed-utils";

XLSX.set_fs(fs);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const STANDARD_LOCATIONS = ["Sekre", "RB1"];

type InstrumentRow = {
  Section?: unknown;
  Type?: unknown;
  Brand?: unknown;
  "Serial Number"?: unknown;
  Condition?: unknown;
  Status?: unknown;
  Location?: unknown;
  Notes?: unknown;
};

type GoodRow = {
  Name?: unknown;
  Brand?: unknown;
  Quantity?: number;
  Condition?: unknown;
  Location?: unknown;
  "Registration No."?: unknown;
  "Registration No"?: unknown;
  Notes?: unknown;
};

async function seedInstruments() {
  const existing = await prisma.instrument.count();
  if (existing > 0) {
    console.log(`Instruments already seeded (${existing} rows), skipping.`);
    return;
  }

  const workbook = XLSX.readFile("prisma/seed-data/instruments.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: InstrumentRow[] = XLSX.utils.sheet_to_json(sheet);

  const instruments = rows.map((row, index) => {
    const rowNumber = index + 2;
    const condition = text(row.Condition) ?? "ok";
    const location = text(row.Location) ?? "Sekre";
    let status = text(row.Status) ?? "available";
    let isLoanable = true;

    if (condition === "retired" || condition === "lost") {
      status = "unavailable";
      isLoanable = false;
    } else if (!STANDARD_LOCATIONS.includes(location)) {
      status = "placed";
    }

    return {
      section: requiredText(row.Section, "Section", rowNumber),
      type: requiredText(row.Type, "Type", rowNumber),
      brand: text(row.Brand),
      serialNumber: text(row["Serial Number"]),
      condition: condition as ItemCondition,
      status: status as InstrumentStatus,
      isLoanable,
      location,
      notes: text(row.Notes),
    };
  });

  const result = await prisma.instrument.createMany({ data: instruments });
  console.log(`Seeded ${result.count} instruments from xlsx.`);
}

async function seedGoods() {
  const existing = await prisma.good.count();
  if (existing > 0) {
    console.log(`Goods already seeded (${existing} rows), skipping.`);
    return;
  }

  const workbook = XLSX.readFile("prisma/seed-data/goods.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: GoodRow[] = XLSX.utils.sheet_to_json(sheet);

  const goods = rows.map((row, index) => ({
    name: requiredText(row.Name, "Name", index + 2),
    brand: text(row.Brand),
    quantity: row.Quantity ?? 1,
    condition: (text(row.Condition) ?? "ok") as ItemCondition,
    location: text(row.Location) ?? "RB1",
    registrationNo: text(row["Registration No."]) ?? text(row["Registration No"]),
    notes: text(row.Notes),
  }));

  const result = await prisma.good.createMany({ data: goods });
  console.log(`Seeded ${result.count} goods from xlsx.`);
}

async function main() {
  await seedInstruments();
  await seedGoods();
}

async function run() {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
