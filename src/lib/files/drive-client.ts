import { google } from "googleapis";
import { Readable } from "stream";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
});

export const drive = google.drive({ version: "v3", auth: oauth2Client });

export function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function getOrCreateFolder(
  name: string,
  parentId: string,
): Promise<string> {
  const existing = await drive.files.list({
    q: `name='${escapeDriveQueryValue(name)}' and '${escapeDriveQueryValue(parentId)}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
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
