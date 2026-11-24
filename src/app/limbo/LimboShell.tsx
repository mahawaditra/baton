"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";

export type LimboMood = "idle" | "holding" | "farewell";

export type LimboFocus = { x: number; y: number };

type SetLimboMood = (mood: LimboMood, focus?: LimboFocus) => void;

const SetLimboMoodContext = createContext<SetLimboMood>(() => {});

export function useSetLimboMood() {
  return useContext(SetLimboMoodContext);
}

const SENTENCES = [
  "Your comrades have been offered up.",
  "Every eclipse they spent alongside you, working hard for Mahawaditra, is remembered — thank you for your patronage.",
  "I hope you never regret this.",
  "One offering remains, and it is yours.",
  "Leave a piece of your soul, and your name will outlive your access.",
  "There is no undoing this.",
];

const ENTRANCE_MS = {
  emblem: 600,
  title: 900,
  firstSentence: 1200,
  sentenceStep: 220,
  offering: 2550,
};

function enterDelay(ms: number) {
  return { "--limbo-delay": `${ms}ms` } as React.CSSProperties;
}

export function LimboShell({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ mood: LimboMood; focus?: LimboFocus }>({
    mood: "idle",
  });
  const setMood = useCallback<SetLimboMood>(
    (mood, focus) =>
      setState((current) => ({ mood, focus: focus ?? current.focus })),
    [],
  );
  const focusStyle = state.focus
    ? ({
        "--limbo-focus-x": `${state.focus.x}px`,
        "--limbo-focus-y": `${state.focus.y}px`,
      } as React.CSSProperties)
    : undefined;

  return (
    <SetLimboMoodContext value={setMood}>
      <AuroraBackground data-limbo-mood={state.mood} style={focusStyle}>
        <div aria-hidden className="limbo-veil fixed inset-0" />
        <main className="relative flex min-h-dynamic items-center justify-center px-6 py-8">
          <div className="limbo-card w-full max-w-xl gold-hairline rounded-t-[50%_9rem] rounded-b-3xl shadow-sm">
            <div className="legacy-plaque relative flex flex-col items-center gap-6 rounded-t-[50%_9rem] rounded-b-3xl px-6 pt-12 pb-10 text-center sm:px-10">
              <span
                data-limbo-enter
                style={enterDelay(ENTRANCE_MS.emblem)}
                className="limbo-glow block"
              >
                <span
                  aria-hidden
                  className="legacy-emblem block aspect-[1146/1820] h-16"
                />
              </span>
              <h1
                data-limbo-enter
                style={enterDelay(ENTRANCE_MS.title)}
                className="font-heading text-h1 text-foreground"
              >
                The sacrifice is made.
              </h1>
              <p className="text-body-lg text-foreground-2">
                {SENTENCES.map((sentence, index) => (
                  <span
                    key={sentence}
                    data-limbo-enter
                    style={enterDelay(
                      ENTRANCE_MS.firstSentence +
                        index * ENTRANCE_MS.sentenceStep,
                    )}
                  >
                    {sentence}
                    {index < SENTENCES.length - 1 && " "}
                  </span>
                ))}
              </p>
              <div
                data-limbo-enter
                style={enterDelay(ENTRANCE_MS.offering)}
                className="w-full"
              >
                {children}
              </div>
            </div>
          </div>
        </main>
        <div aria-hidden className="limbo-vignette fixed inset-0" />
      </AuroraBackground>
    </SetLimboMoodContext>
  );
}
