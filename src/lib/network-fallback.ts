export const NETWORK_ERROR_MESSAGE =
  "Gagal terhubung ke server. Cek koneksi kamu lalu coba lagi.";

type FieldsActionState = {
  error: string | null;
  generalError: string | null;
  fields: Record<string, string>;
};

export function textFieldsOf(formData: FormData): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string") fields[key] = value;
  }
  return fields;
}

export function withNetworkFallback<S extends FieldsActionState>(
  action: (prevState: S, formData: FormData) => Promise<S>,
) {
  return async (prevState: S, formData: FormData): Promise<S> => {
    try {
      return await action(prevState, formData);
    } catch {
      return {
        ...prevState,
        error: null,
        generalError: NETWORK_ERROR_MESSAGE,
        fields: textFieldsOf(formData),
      };
    }
  };
}
