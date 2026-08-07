import "dotenv/config";
import { drive } from "../src/lib/drive";

async function checkFolder(label: string, fileId: string) {
  try {
    const res = await drive.files.get({
      fileId,
      fields: "id, name, trashed, createdTime, parents",
    });
    console.log(`[${label}] ${fileId}`, res.data);
  } catch (err) {
    console.log(`[${label}] ${fileId} — ERROR:`, (err as Error).message);
  }
}

async function main() {
  await checkFolder("OLD", "1Mgb8gLTK0Ty-iOTJWn8X1TbwQjH2dEdx");
  await checkFolder("NEW", "17l5JFVHwZ849B4ypt0awq4v1FhLqwUly");
}

main();
