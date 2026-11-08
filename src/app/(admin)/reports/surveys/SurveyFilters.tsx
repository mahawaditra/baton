"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import type { SurveyForm } from "@/generated/prisma/enums";
import { SegmentedControl } from "@/components/SegmentedControl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ALL_TIME = "all";

function resultsHref(form: SurveyForm, period: string) {
  return period === ALL_TIME
    ? `/reports/surveys?form=${form}`
    : `/reports/surveys?form=${form}&year=${period}`;
}

export function SurveyFilters({
  forms,
  activeForm,
  periods,
  activePeriod,
  children,
}: {
  forms: { id: SurveyForm; label: string }[];
  activeForm: SurveyForm;
  periods: { id: string; label: string }[];
  activePeriod: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selection, setSelection] = useOptimistic({
    form: activeForm,
    period: activePeriod,
  });

  function navigate(form: SurveyForm, period: string) {
    startTransition(() => {
      setSelection({ form, period });
      router.push(resultsHref(form, period), { scroll: false });
    });
  }

  const periodOptions = [
    { value: ALL_TIME, label: "All-time" },
    ...periods.map(({ id, label }) => ({ value: id, label })),
  ];

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SegmentedControl
          ariaLabel="Survey"
          options={forms.map((form) => ({
            ...form,
            href: resultsHref(form.id, ALL_TIME),
          }))}
          value={selection.form}
          onChange={(form) => navigate(form, ALL_TIME)}
          className="w-full sm:w-fit"
        />
        <Select
          items={periodOptions}
          value={selection.period}
          onValueChange={(period) => {
            if (period) navigate(selection.form, period);
          }}
        >
          <SelectTrigger aria-label="Period" className="tabular w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="tabular"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={cn(
          "flex flex-col gap-6 transition-opacity duration-150",
          isPending && "opacity-60",
        )}
      >
        {children}
      </div>
    </>
  );
}
