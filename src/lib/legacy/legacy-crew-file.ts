export function patchLegacyCrewSource(
  source: string,
  update: { slug: string; fileId: string; mimeType: string },
): string {
  const start = source.indexOf(`slug: "${update.slug}"`);
  if (start === -1) {
    throw new Error(`No crew member with slug "${update.slug}" in legacy-crew.ts`);
  }

  const end = source.indexOf("\n  },", start);
  if (end === -1) {
    throw new Error(`Could not find the end of the "${update.slug}" entry`);
  }

  const block = source.slice(start, end);
  const idPattern = /photoDriveFileId: (?:null|"[^"]*"),/;
  const mimePattern = /mimeType: "[^"]*",/;
  if (!idPattern.test(block) || !mimePattern.test(block)) {
    throw new Error(
      `The "${update.slug}" entry is missing photoDriveFileId or mimeType`,
    );
  }

  const patched = block
    .replace(idPattern, `photoDriveFileId: "${update.fileId}",`)
    .replace(mimePattern, `mimeType: "${update.mimeType}",`);

  return source.slice(0, start) + patched + source.slice(end);
}
