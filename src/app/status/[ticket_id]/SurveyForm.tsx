"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { submitSurvey } from "./actions";
import { toastError } from "@/lib/toast";
import { withNetworkFallback } from "@/lib/network-fallback";
import {
  SURVEY_COMMENT_MAX_LENGTH,
  SURVEY_DEFINITIONS,
  SURVEY_PAGE_ORDER,
  SURVEY_RATING_SCALE,
  commentFieldName,
  ratingFieldName,
} from "@/lib/survey/survey-definition";
import { MusicGlyph } from "@/components/MusicGlyph";
import { SegmentBar } from "@/components/SegmentBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initialState = {
  success: false,
  error: null,
  generalError: null,
  fields: {},
};

const PILL_CLASS =
  "rating-pill flex cursor-pointer items-center justify-center rounded border border-border bg-surface text-label transition-colors hover:bg-muted peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:hover:bg-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50";

const RATING_DYNAMICS = {
  1: "dynamicP",
  2: "dynamicMP",
  3: "dynamicMF",
  4: "dynamicF",
  5: "dynamicSFZ",
} as const;

function RatingQuestion({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const lowest = SURVEY_RATING_SCALE[0].label;
  const highest = SURVEY_RATING_SCALE[SURVEY_RATING_SCALE.length - 1].label;

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="text-label text-foreground">{label}</legend>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {SURVEY_RATING_SCALE.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              required
              checked={value === String(option.value)}
              onChange={(event) => onChange(event.target.value)}
              className="peer sr-only"
            />
            <span title={option.label} className={`${PILL_CLASS} h-10`}>
              <MusicGlyph
                glyph={RATING_DYNAMICS[option.value]}
                className="text-[2.25rem] sm:text-[2.5rem]"
              />
              <span className="sr-only">{option.label}</span>
            </span>
          </label>
        ))}
      </div>
      <div
        aria-hidden
        className="flex justify-between text-caption text-muted-foreground"
      >
        <span>{lowest}</span>
        <span>{highest}</span>
      </div>
    </fieldset>
  );
}

export function SurveyForm({
  ticketId,
  accessCode,
  onSuccess,
  onCancel,
}: {
  ticketId: string;
  accessCode: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const action = withNetworkFallback(
    submitSurvey.bind(null, ticketId, accessCode),
  );
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const topRef = useRef<HTMLDivElement>(null);

  const form = SURVEY_PAGE_ORDER[page];
  const definition = SURVEY_DEFINITIONS[form];
  const isLastPage = page === SURVEY_PAGE_ORDER.length - 1;

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  useEffect(() => {
    if (state.generalError) toastError(state.generalError);
  }, [state]);

  function setAnswer(name: string, value: string) {
    setAnswers((current) => ({ ...current, [name]: value }));
  }

  function goToPage(nextPage: number) {
    setDirection(nextPage > page ? "forward" : "back");
    setPage(nextPage);
    topRef.current?.focus({ preventScroll: true });
    topRef.current?.scrollIntoView({ block: "start" });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLastPage) {
      goToPage(page + 1);
      return;
    }
    const formData = new FormData();
    for (const [name, value] of Object.entries(answers)) {
      formData.set(name, value);
    }
    startTransition(() => formAction(formData));
  }

  return (
    <Card className="survey-enter">
      <CardHeader
        ref={topRef}
        tabIndex={-1}
        className="scroll-mt-6 outline-none"
      >
        <div className="flex flex-col gap-1.5 pb-2">
          <SegmentBar filled={page + 1} total={SURVEY_PAGE_ORDER.length} />
          <div className="tabular text-caption text-muted-foreground">
            Halaman {page + 1} dari {SURVEY_PAGE_ORDER.length}
          </div>
        </div>
        <CardTitle>{definition.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          key={form}
          onSubmit={handleSubmit}
          className={cn(
            "flex flex-col gap-5",
            (page > 0 || direction === "back") && `survey-page-${direction}`,
          )}
        >
          <p className="text-body text-foreground-2">{definition.intro}</p>

          {definition.questions.map((question) => {
            const name = ratingFieldName(form, question.key);
            return (
              <RatingQuestion
                key={name}
                name={name}
                label={question.label}
                value={answers[name] ?? ""}
                onChange={(value) => setAnswer(name, value)}
              />
            );
          })}

          {definition.comments.map((comment) => {
            const name = commentFieldName(form, comment.key);
            return (
              <div key={name} className="flex flex-col gap-1.5">
                <Label htmlFor={name}>{comment.label} (opsional)</Label>
                {comment.hint && (
                  <p className="text-caption text-muted-foreground">
                    {comment.hint}
                  </p>
                )}
                <Textarea
                  id={name}
                  name={name}
                  maxLength={SURVEY_COMMENT_MAX_LENGTH}
                  value={answers[name] ?? ""}
                  onChange={(event) => setAnswer(name, event.target.value)}
                />
              </div>
            );
          })}

          {state.error && (
            <p className="text-sm text-destructive" aria-live="polite">
              {state.error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isPending}>
              {!isLastPage
                ? "Lanjut"
                : isPending
                  ? "Mengirim..."
                  : "Kirim Survey"}
            </Button>
            {page > 0 && (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => goToPage(page - 1)}
              >
                Kembali
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={onCancel}
            >
              Nanti aja
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
