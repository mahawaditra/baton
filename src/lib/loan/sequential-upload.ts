export type UploadOutcome = {
  success: boolean;
  error: string | null;
  generalError: string | null;
};

export type UploadItem<K extends string> = { key: K; file: File };

export type UploadBatchResult<K extends string> = {
  succeeded: K[];
  errors: Partial<Record<K, string>>;
  generalError: string | null;
};

export const UPLOAD_NETWORK_ERROR =
  "Upload gagal. Cek koneksi kamu lalu coba lagi.";

export async function uploadSequentially<K extends string>(
  items: UploadItem<K>[],
  upload: (key: K, file: File) => Promise<UploadOutcome>,
  onSettled?: (key: K, outcome: UploadOutcome) => void,
): Promise<UploadBatchResult<K>> {
  const result: UploadBatchResult<K> = {
    succeeded: [],
    errors: {},
    generalError: null,
  };

  for (const item of items) {
    let outcome: UploadOutcome;
    try {
      outcome = await upload(item.key, item.file);
    } catch {
      result.generalError = UPLOAD_NETWORK_ERROR;
      break;
    }

    onSettled?.(item.key, outcome);

    if (outcome.success) {
      result.succeeded.push(item.key);
      continue;
    }
    if (outcome.generalError) {
      result.generalError = outcome.generalError;
      break;
    }
    result.errors[item.key] = outcome.error ?? "Upload gagal.";
  }

  return result;
}
