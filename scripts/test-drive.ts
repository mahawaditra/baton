import "dotenv/config";
import { drive } from "../src/lib/drive";

async function main() {
  const res = await drive.files.create({
    requestBody: {
      name: "test-connection.txt",
      parents: [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!],
    },
    media: {
      mimeType: "text/plain",
      body: "This is a test file to check the connection to Google Drive from BATON.",
    },
    fields: "id, name",
  });

  console.log("Successfully created file:", res.data);
}

main().catch(console.error);
