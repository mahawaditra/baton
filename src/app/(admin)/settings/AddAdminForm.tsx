"use client";

import { useActionState, useEffect } from "react";
import { addAdmin, AddAdminState } from "./actions";
import { ADMIN_NAME_MAX_LENGTH } from "@/lib/admin/admin-schemas";
import { toastError } from "@/lib/toast";
import { getRoleLabel } from "@/lib/labels";
import { submitWithoutReset } from "@/lib/submit-without-reset";
import type { AdminRole } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, useFocusFirstInvalid } from "@/components/Field";
import { Notice } from "@/components/Notice";

const initialState: AddAdminState = {
  success: false,
  error: null,
  generalError: null,
};

export function AddAdminForm({ roles }: { roles: AdminRole[] }) {
  const [state, formAction, isPending] = useActionState(addAdmin, initialState);
  const errors = state.fieldErrors ?? {};
  const formRef = useFocusFirstInvalid(state.fieldErrors);
  const roleOptions = roles.map((role) => ({
    value: role,
    label: getRoleLabel(role),
  }));

  useEffect(() => {
    if (state.generalError) toastError(state.generalError);
    if (state.success) formRef.current?.reset();
  }, [state, formRef]);

  return (
    <form
      ref={formRef}
      onSubmit={submitWithoutReset(formAction)}
      noValidate
      className="flex flex-col gap-3"
    >
      {state.error && (
        <Notice tone="danger" compact aria-live="polite">
          {state.error}
        </Notice>
      )}
      {state.success && (
        <p
          className="text-sm font-medium text-success-soft-foreground"
          aria-live="polite"
        >
          Admin added successfully.
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
        <Field
          label="Email"
          error={errors.email}
          className="sm:min-w-48 sm:flex-1"
        >
          {(control) => (
            <Input
              {...control}
              name="email"
              type="email"
              placeholder="New admin email"
              required
            />
          )}
        </Field>
        <Field
          label="Name"
          error={errors.name}
          className="sm:min-w-48 sm:flex-1"
        >
          {(control) => (
            <Input
              {...control}
              name="name"
              type="text"
              placeholder="New admin name"
              required
              maxLength={ADMIN_NAME_MAX_LENGTH}
            />
          )}
        </Field>
        {roleOptions.length > 1 && (
          <Field label="Role" error={errors.role} className="sm:w-40">
            {(control) => (
              <Select name="role" items={roleOptions} defaultValue="staff">
                <SelectTrigger {...control} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
        )}
        <Button
          type="submit"
          disabled={isPending}
          className="self-start sm:mt-[1.625rem]"
        >
          {isPending ? "Adding..." : "Add admin"}
        </Button>
      </div>
    </form>
  );
}
