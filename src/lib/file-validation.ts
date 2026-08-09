export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

type AllowedMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];

const MAX_UPLOAD_SIZE_BYTES = 1300 * 1024;

export const MAX_UPLOAD_SIZE_LABEL = `${(MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)).toFixed(1)}MB`;

const MAGIC_BYTES: Record<AllowedMimeType, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
};

async function detectRealMimeType(file: File): Promise<AllowedMimeType | null> {
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());

  for (const [mimeType, signature] of Object.entries(MAGIC_BYTES) as [
    AllowedMimeType,
    number[],
  ][]) {
    if (signature.every((byte, i) => header[i] === byte)) {
      return mimeType;
    }
  }

  return null;
}

type FileValidationResult =
  | { valid: true; mimeType: AllowedMimeType }
  | { valid: false; error: string };

async function validateFile(
  file: File | null,
  allowedTypes: readonly AllowedMimeType[],
  typeLabel: string,
): Promise<FileValidationResult> {
  if (!file || file.size === 0) {
    return { valid: false, error: "File is required." };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { valid: false, error: `File must be ${MAX_UPLOAD_SIZE_LABEL} or smaller.` };
  }

  const realType = await detectRealMimeType(file);
  if (!realType || !allowedTypes.includes(realType)) {
    return { valid: false, error: `File must be ${typeLabel}.` };
  }

  return { valid: true, mimeType: realType };
}

export function validateImageUpload(
  file: File | null,
): Promise<FileValidationResult> {
  return validateFile(file, ["image/jpeg", "image/png"], "a JPEG or PNG image");
}

export function validateDocumentUpload(
  file: File | null,
): Promise<FileValidationResult> {
  return validateFile(
    file,
    ALLOWED_UPLOAD_MIME_TYPES,
    "a JPEG, PNG, or PDF file",
  );
}
