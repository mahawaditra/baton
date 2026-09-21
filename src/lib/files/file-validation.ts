export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

type AllowedMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];

export const MAX_UPLOAD_SIZE_BYTES = 4 * 1024 * 1024 - 20 * 1024;

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
    return { valid: false, error: "File wajib dipilih." };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      valid: false,
      error: `Ukuran file maksimal ${MAX_UPLOAD_SIZE_LABEL}.`,
    };
  }

  const realType = await detectRealMimeType(file);
  if (!realType || !allowedTypes.includes(realType)) {
    return { valid: false, error: `File harus berupa ${typeLabel}.` };
  }

  return { valid: true, mimeType: realType };
}

export function validateImageUpload(
  file: File | null,
): Promise<FileValidationResult> {
  return validateFile(file, ["image/jpeg", "image/png"], "gambar JPEG atau PNG");
}

export function validateDocumentUpload(
  file: File | null,
): Promise<FileValidationResult> {
  return validateFile(
    file,
    ALLOWED_UPLOAD_MIME_TYPES,
    "file JPEG, PNG, atau PDF",
  );
}
