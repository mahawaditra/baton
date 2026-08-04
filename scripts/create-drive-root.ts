import "dotenv/config";
import { drive } from "../src/lib/drive";

async function main() {
  const res = await drive.files.create({
    requestBody: {
      name: "BATON",
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id, name",
  });

  console.log("Root folder created:", res.data);
  console.log("\nSave this ID to .env as GOOGLE_DRIVE_ROOT_FOLDER_ID:");
  console.log(res.data.id);
}

main().catch(console.error);
