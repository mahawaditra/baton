"use client";

import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";
import type { FieldErrors } from "@/lib/form-errors";

type ContractField = {
  name:
    | "ktpNumber"
    | "addressKtp"
    | "addressDomicile"
    | "faculty"
    | "major"
    | "guardianName"
    | "guardianPhone"
    | "guardianAddressKtp";
  label: string;
  maxLength: number;
  type?: "text" | "tel";
  inputMode?: "numeric";
  placeholder?: string;
  tabular?: boolean;
};

export type ContractDataValues = Partial<Record<ContractField["name"], string>>;

const BORROWER_FIELDS: ContractField[] = [
  {
    name: "ktpNumber",
    label: "Nomor KTP",
    maxLength: 16,
    inputMode: "numeric",
    placeholder: "16 digit",
    tabular: true,
  },
  { name: "addressKtp", label: "Alamat (sesuai KTP)", maxLength: 300 },
  { name: "addressDomicile", label: "Alamat domisili", maxLength: 300 },
  {
    name: "faculty",
    label: "Fakultas",
    maxLength: 60,
    placeholder: "mis. FIB",
  },
  {
    name: "major",
    label: "Jurusan / program studi",
    maxLength: 60,
    placeholder: "mis. Sastra Jepang",
  },
];

const GUARDIAN_FIELDS: ContractField[] = [
  { name: "guardianName", label: "Nama wali", maxLength: 100 },
  {
    name: "guardianPhone",
    label: "Nomor HP wali",
    maxLength: 20,
    type: "tel",
    tabular: true,
  },
  {
    name: "guardianAddressKtp",
    label: "Alamat wali (sesuai KTP)",
    maxLength: 300,
  },
];

function ContractInput({
  field,
  values,
  errors,
}: {
  field: ContractField;
  values: ContractDataValues;
  errors: FieldErrors;
}) {
  return (
    <Field label={field.label} error={errors[field.name]}>
      {(control) => (
        <Input
          {...control}
          name={field.name}
          type={field.type ?? "text"}
          inputMode={field.inputMode}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          className={field.tabular ? "tabular" : undefined}
          defaultValue={values[field.name] ?? ""}
          required
        />
      )}
    </Field>
  );
}

export function ContractDataFields({
  values,
  errors,
}: {
  values: ContractDataValues;
  errors: FieldErrors;
}) {
  return (
    <>
      {BORROWER_FIELDS.map((field) => (
        <ContractInput
          key={field.name}
          field={field}
          values={values}
          errors={errors}
        />
      ))}
      <div className="mt-2 flex flex-col gap-4 border-t border-border pt-4">
        <h3 className="text-title text-foreground">Data wali</h3>
        {GUARDIAN_FIELDS.map((field) => (
          <ContractInput
            key={field.name}
            field={field}
            values={values}
            errors={errors}
          />
        ))}
      </div>
    </>
  );
}
