import { google } from "googleapis";
import { Readable } from "stream";
import { prisma } from "@/lib/prisma";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
});

export const drive = google.drive({ version: "v3", auth: oauth2Client });

export async function getOrCreateYearFolder(year: number): Promise<string> {
  const settings = await prisma.loanSetting.findFirst();

  if (
    settings?.currentYearFolderId &&
    settings.currentYearFolderYear === year
  ) {
    try {
      const check = await drive.files.get({
        fileId: settings.currentYearFolderId,
        fields: "id, trashed",
      });
      if (!check.data.trashed) {
        return settings.currentYearFolderId;
      }
    } catch {}
  }

  const folderName = `Logistik ${year}`;
  const root = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;

  const existing = await drive.files.list({
    q: `name='${folderName}' and '${root}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });

  let folderId: string;

  if (existing.data.files && existing.data.files.length > 0) {
    folderId = existing.data.files[0].id!;
  } else {
    const created = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [root],
      },
      fields: "id",
    });
    folderId = created.data.id!;
  }

  if (settings) {
    await prisma.loanSetting.update({
      where: { id: settings.id },
      data: { currentYearFolderId: folderId, currentYearFolderYear: year },
    });
  }

  return folderId;
}

export async function getOrCreateFolder(
  name: string,
  parentId: string,
): Promise<string> {
  const existing = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });

  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id!;
  }

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });

  return created.data.id!;
}

export async function getGeneratedContractFolder(
  year: number,
): Promise<string> {
  const yearFolder = await getOrCreateYearFolder(year);
  const peminjamanFolder = await getOrCreateFolder(
    "Peminjaman Alat",
    yearFolder,
  );
  return getOrCreateFolder("Generated Contract", peminjamanFolder);
}

export async function getBorrowerArchiveFolder(
  year: number,
  ticketId: string,
  borrowerName: string,
): Promise<string> {
  const yearFolder = await getOrCreateYearFolder(year);
  const peminjamanFolder = await getOrCreateFolder(
    "Peminjaman Alat",
    yearFolder,
  );
  const archiveRoot = await getOrCreateFolder(
    "Borrower Archive",
    peminjamanFolder,
  );
  return getOrCreateFolder(`${ticketId}_${borrowerName}`, archiveRoot);
}

export async function uploadFile(
  name: string,
  mimeType: string,
  content: Buffer,
  parentFolderId: string,
): Promise<string> {
  const stream = Readable.from(content);

  const res = await drive.files.create({
    requestBody: { name, parents: [parentFolderId] },
    media: { mimeType, body: stream },
    fields: "id",
  });

  return res.data.id!;
}

export async function fetchFileBytes(fileId: string): Promise<Buffer> {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );
  return Buffer.from(res.data as ArrayBuffer);
}

export async function downloadFileAsBase64(
  fileId: string,
  mimeType: string,
): Promise<string> {
  const buffer = await fetchFileBytes(fileId);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
