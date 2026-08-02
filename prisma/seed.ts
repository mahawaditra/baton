import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as XLSX from "xlsx/xlsx.mjs";
import * as fs from "fs";

XLSX.set_fs(fs);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const STANDARD_LOCATIONS = ["Sekre", "RB1"];

type Row = {
  Section: string;
  Type: string;
  Brand?: string;
  "Serial Number"?: string;
  Condition: string;
  Status: string;
  Location: string;
  Notes?: string;
};

async function main() {
  const workbook = XLSX.readFile("prisma/seed-data/instruments.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Row[] = XLSX.utils.sheet_to_json(sheet);

  const instruments = rows.map((row) => {
    const condition = (row.Condition || "ok") as string;
    const location = row.Location || "Sekre";
    let status = (row.Status || "available") as string;

    if (condition === "retired" || condition === "lost") {
      status = "unavailable";
    } else if (!STANDARD_LOCATIONS.includes(location)) {
      status = "placed";
    }

    return {
      section: row.Section,
      type: row.Type,
      brand: row.Brand || null,
      serialNumber: row["Serial Number"] || null,
      condition: condition as any,
      status: status as any,
      location,
      notes: row.Notes || null,
    };
  });

  const result = await prisma.instrument.createMany({
    data: instruments,
  });
  console.log(`Seeded ${result.count} instruments from Excel file.`);
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
