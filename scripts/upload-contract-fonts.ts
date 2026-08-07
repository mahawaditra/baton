import "dotenv/config";
import fs from "fs";
import { drive, getOrCreateFolder } from "../src/lib/drive";

const FONTS = [
  { file: "C:/Windows/Fonts/times.ttf", name: "Times New Roman Regular.ttf" },
  { file: "C:/Windows/Fonts/timesbd.ttf", name: "Times New Roman Bold.ttf" },
  { file: "C:/Windows/Fonts/timesi.ttf", name: "Times New Roman Italic.ttf" },
];

async function main() {
  const root = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;
  const assetsFolderId = await getOrCreateFolder("Assets", root);
  const fontsFolderId = await getOrCreateFolder("Fonts", assetsFolderId);

  console.log("Upload ke folder Fonts, ID:", fontsFolderId);
  console.log("---");

  for (const font of FONTS) {
    const res = await drive.files.create({
      requestBody: { name: font.name, parents: [fontsFolderId] },
      media: { mimeType: "font/ttf", body: fs.createReadStream(font.file) },
      fields: "id, name",
    });
    console.log(`${font.name} -> fileId: ${res.data.id}`);
  }

  console.log("---");
  console.log(
    "Copy 3 fileId di atas ke env var CONTRACT_FONT_REGULAR_DRIVE_ID / _BOLD_ / _ITALIC_ sesuai urutan.",
  );
}

main().catch(console.error);
