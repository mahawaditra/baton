import { Check } from "lucide-react";
import { HANDBOOK_ROLES, ROLE_CAPABILITIES } from "./role-capabilities";

function RoleChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-caption text-foreground-2">
      {children}
    </span>
  );
}

function RoleList() {
  return (
    <ul className="flex flex-col sm:hidden">
      {ROLE_CAPABILITIES.map(({ label, allowed }) => {
        const roles = HANDBOOK_ROLES.filter(({ role }) => allowed(role));
        return (
          <li
            key={label}
            className="flex flex-col gap-1.5 border-t border-border py-2.5 first:border-t-0 first:pt-0"
          >
            <span className="text-foreground">{label}</span>
            <span className="flex flex-wrap gap-1">
              {roles.length === HANDBOOK_ROLES.length ? (
                <RoleChip>Semua role</RoleChip>
              ) : (
                roles.map(({ role, label: roleLabel }) => (
                  <RoleChip key={role}>{roleLabel}</RoleChip>
                ))
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function RoleTable() {
  return (
    <table className="hidden w-full table-fixed text-sm sm:table">
      <thead>
        <tr className="align-bottom">
          <th scope="col" className="w-[40%] pb-2">
            <span className="sr-only">Kemampuan</span>
          </th>
          {HANDBOOK_ROLES.map(({ role, label, caption }) => (
            <th
              key={role}
              scope="col"
              className="px-0.5 pb-2 text-center text-caption font-semibold text-foreground"
            >
              {label}
              <span className="mt-0.5 block text-micro font-normal tracking-normal text-muted-foreground">
                {caption}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROLE_CAPABILITIES.map(({ label, allowed }) => (
          <tr key={label} className="border-t border-border">
            <th
              scope="row"
              className="py-2 pr-2 text-left font-normal text-foreground-2"
            >
              {label}
            </th>
            {HANDBOOK_ROLES.map(({ role, label: roleLabel }) =>
              allowed(role) ? (
                <td key={role} className="text-center">
                  <Check
                    aria-label={`${roleLabel} bisa`}
                    className="mx-auto h-4 w-4 text-success"
                    strokeWidth={2}
                  />
                </td>
              ) : (
                <td key={role} className="text-center text-muted-foreground">
                  <span aria-hidden>–</span>
                  <span className="sr-only">{roleLabel} nggak bisa</span>
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RoleMatrix() {
  return (
    <>
      <RoleTable />
      <RoleList />
    </>
  );
}
