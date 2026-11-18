import "dotenv/config";
import { spawn } from "node:child_process";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { getOrCreateFolder, uploadFile } from "../src/lib/files/drive-client";
import { driveTimestamp } from "../src/lib/format";

const BACKUP_FOLDER = "Database Backups";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function dumpDatabase(connectionString: string): Promise<Buffer> {
  const pgDump = spawn(
    process.env.PG_DUMP || "pg_dump",
    ["--format=plain", "--no-password", `--dbname=${connectionString}`],
    { stdio: ["ignore", "pipe", "inherit"] },
  );

  const exited = new Promise<number | null>((resolve, reject) => {
    pgDump.on("error", reject);
    pgDump.on("close", resolve);
  });

  const chunks: Buffer[] = [];
  const [code] = await Promise.all([
    exited,
    pipeline(pgDump.stdout, createGzip(), async (source) => {
      for await (const chunk of source) chunks.push(chunk);
    }),
  ]);

  if (code !== 0) throw new Error(`pg_dump exited with code ${code}`);
  return Buffer.concat(chunks);
}

async function main() {
  const connectionString = requireEnv("DIRECT_URL");
  const rootFolderId = requireEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID");
  requireEnv("GOOGLE_CLIENT_ID");
  requireEnv("GOOGLE_CLIENT_SECRET");
  requireEnv("GOOGLE_DRIVE_REFRESH_TOKEN");

  const dump = await dumpDatabase(connectionString);
  const folderId = await getOrCreateFolder(BACKUP_FOLDER, rootFolderId);
  const name = `BATON_${driveTimestamp()}.sql.gz`;
  const fileId = await uploadFile(name, "application/gzip", dump, folderId);

  console.log(
    `Uploaded ${name} (${Math.ceil(dump.length / 1024)} KB) to ${BACKUP_FOLDER}, Drive file ${fileId}`,
  );
}

main().catch((error) => {
  console.error(
    `Backup failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
