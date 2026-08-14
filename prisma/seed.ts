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

XLSX.set_fs(fs);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const STANDARD_LOCATIONS = ["Sekre", "RB1"];

type InstrumentRow = {
  Section: string;
  Type: string;
  Brand?: string;
  "Serial Number"?: string;
  Condition: string;
  Status: string;
  Location: string;
  Notes?: string;
};

type GoodRow = {
  Name: string;
  Brand?: string;
  Quantity?: number;
  Condition?: string;
  Location?: string;
  "Registration No"?: string;
  Notes?: string;
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

  const instruments = rows.map((row) => {
    const condition = (row.Condition || "ok") as string;
    const location = row.Location || "Sekre";
    let status = (row.Status || "available") as string;
    let isLoanable = true;

    if (condition === "retired" || condition === "lost") {
      status = "unavailable";
      isLoanable = false;
    } else if (!STANDARD_LOCATIONS.includes(location)) {
      status = "placed";
    }

    return {
      section: row.Section,
      type: row.Type,
      brand: row.Brand || null,
      serialNumber: row["Serial Number"] || null,
      condition: condition as ItemCondition,
      status: status as InstrumentStatus,
      isLoanable,
      location,
      notes: row.Notes || null,
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

  const goods = rows.map((row) => ({
    name: row.Name,
    brand: row.Brand || null,
    quantity: row.Quantity || 1,
    condition: (row.Condition || "ok") as ItemCondition,
    location: row.Location || "RB1",
    registrationNo: row["Registration No"] || null,
    notes: row.Notes || null,
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
