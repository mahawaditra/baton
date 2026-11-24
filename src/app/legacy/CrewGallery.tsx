"use client";

import { createContext, useContext, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

export type CrewGalleryMember = { slug: string; name: string; lines: string[] };

const VIEW_TRANSITION_NAME = "crew-photo";
const STAGE_SIZE = "min(26rem, 58svh, 78vw)";
const NEIGHBOUR_SHIFT = 58;
const NEIGHBOUR_SCALE = 0.82;
const NEIGHBOUR_TILT_DEG = 5;
const VISIBLE_RANGE = 1;
const RENDER_RANGE = 2;
const FIRST_STEP_RATIO = 0.18;
const NEXT_STEP_RATIO = 0.45;
const FOLDED_SCALE = 0.9;
const TAP_SLOP_PX = 6;
const MAX_WAIT_FRAMES = 20;

const PREVIEW_SELECTOR = "[data-crew-preview]";

export function crewPhotoSrc(slug: string) {
  return `/legacy/photo/crew/${slug}`;
}

const preloads = new Map<string, Promise<void>>();

function preload(src: string) {
  let pending = preloads.get(src);
  if (!pending) {
    pending = new Promise<void>((resolve) => {
      const image = new window.Image();
      image.onload = () => resolve();
      image.onerror = () => {
        preloads.delete(src);
        resolve();
      };
      image.src = src;
    });
    preloads.set(src, pending);
  }
  return pending;
}

function ringOffset(index: number, current: number, count: number) {
  const raw = (index - current + count) % count;
  return raw > count / 2 ? raw - count : raw;
}

function thumbOf(slug: string) {
  return document.querySelector<HTMLElement>(
    `[data-crew-thumb="${CSS.escape(slug)}"]`,
  );
}

function canMorph() {
  return (
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function waitFor(condition: () => boolean) {
  return new Promise<void>((resolve) => {
    let frames = 0;
    function check() {
      if (condition() || frames >= MAX_WAIT_FRAMES) {
        resolve();
        return;
      }
      frames += 1;
      requestAnimationFrame(check);
    }
    check();
  });
}

function cardStyle(offset: number, fanned: boolean): React.CSSProperties {
  const distance = Math.abs(offset);
  const folded = !fanned && offset !== 0;
  const shift = folded ? 0 : offset * NEIGHBOUR_SHIFT;
  const scale = offset === 0 ? 1 : folded ? FOLDED_SCALE : NEIGHBOUR_SCALE;
  const tilt = folded ? 0 : offset * NEIGHBOUR_TILT_DEG;
  return {
    transform: `translateX(${shift}%) scale(${scale}) rotate(${tilt}deg)`,
    zIndex: RENDER_RANGE + 1 - distance,
    opacity: distance > VISIBLE_RANGE ? 0 : 1,
    filter: offset === 0 ? "none" : "brightness(0.45) saturate(0.7)",
    viewTransitionName: offset === 0 ? VIEW_TRANSITION_NAME : undefined,
  };
}

const OpenCrewPhotoContext = createContext<(slug: string) => void>(() => {});

export function useOpenCrewPhoto() {
  return useContext(OpenCrewPhotoContext);
}

export function CrewGalleryProvider({
  members,
  children,
}: {
  members: CrewGalleryMember[];
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fanned, setFanned] = useState(false);
  const indexRef = useRef<number | null>(null);
  const requestRef = useRef(0);
  const transitionRef = useRef<ViewTransition | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    anchorX: number;
    firstStepPx: number;
    nextStepPx: number;
    stepped: boolean;
    travelled: number;
    pressedOffset: number;
  } | null>(null);

  function commit(next: number | null) {
    indexRef.current = next;
    flushSync(() => setIndex(next));
  }

  function preloadAround(center: number) {
    for (let offset = -VISIBLE_RANGE; offset <= VISIBLE_RANGE; offset += 1) {
      const member =
        members[(center + offset + members.length) % members.length];
      preload(crewPhotoSrc(member.slug));
    }
  }

  async function settle() {
    const running = transitionRef.current;
    if (!running) return;
    running.skipTransition();
    await running.finished.catch(() => {});
  }

  function morph(update: () => Promise<void>, after?: () => void) {
    const root = document.documentElement;
    root.dataset.crewMorph = "";
    const transition = document.startViewTransition(update);
    transitionRef.current = transition;
    transition.finished.finally(() => {
      if (transitionRef.current === transition) {
        transitionRef.current = null;
        delete root.dataset.crewMorph;
      }
      after?.();
    });
  }

  function fanOut() {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (indexRef.current !== null) setFanned(true);
      }),
    );
  }

  async function open(slug: string) {
    const next = members.findIndex((member) => member.slug === slug);
    if (next < 0 || indexRef.current !== null) return;
    const request = ++requestRef.current;
    await settle();
    preloadAround(next);
    await preload(crewPhotoSrc(slug));
    if (request !== requestRef.current || indexRef.current !== null) return;

    setFanned(false);
    const thumb = thumbOf(slug);
    if (!thumb || !canMorph()) {
      commit(next);
      fanOut();
      return;
    }

    thumb.style.viewTransitionName = VIEW_TRANSITION_NAME;
    morph(async () => {
      thumb.style.viewTransitionName = "";
      commit(next);
      await waitFor(() => document.querySelector(PREVIEW_SELECTOR) !== null);
    }, fanOut);
  }

  async function close() {
    if (indexRef.current === null) return;
    ++requestRef.current;
    await settle();
    const current = indexRef.current;
    if (current === null) return;

    const thumb = thumbOf(members[current].slug);
    if (!thumb || !canMorph()) {
      commit(null);
      return;
    }

    morph(
      async () => {
        document
          .querySelector<HTMLElement>(PREVIEW_SELECTOR)
          ?.style.setProperty("view-transition-name", "none");
        commit(null);
        thumb.style.viewTransitionName = VIEW_TRANSITION_NAME;
        await waitFor(() => document.querySelector(PREVIEW_SELECTOR) === null);
      },
      () => {
        thumb.style.viewTransitionName = "";
      },
    );
  }

  function step(delta: number) {
    const current = indexRef.current;
    if (current === null || members.length < 2 || delta === 0) return;
    const next = (current + delta + members.length) % members.length;
    preloadAround(next);
    commit(next);
  }

  function moveDrag(event: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    let distance = event.clientX - drag.anchorX;
    drag.travelled = Math.max(drag.travelled, Math.abs(distance));
    let required = drag.stepped ? drag.nextStepPx : drag.firstStepPx;
    while (Math.abs(distance) >= required) {
      const direction = distance < 0 ? 1 : -1;
      step(direction);
      drag.anchorX -= direction * required;
      drag.stepped = true;
      required = drag.nextStepPx;
      distance = event.clientX - drag.anchorX;
    }
  }

  function endDrag(event: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (drag.travelled < TAP_SLOP_PX) step(drag.pressedOffset);
  }

  const member = index === null ? null : members[index];

  return (
    <OpenCrewPhotoContext value={open}>
      {children}
      <DialogPrimitive.Root
        open={index !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) close();
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" />
          <DialogPrimitive.Popup
            data-dismiss
            onClick={(event) => {
              if (
                event.target instanceof HTMLElement &&
                event.target.dataset.dismiss !== undefined
              ) {
                close();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") step(-1);
              if (event.key === "ArrowRight") step(1);
            }}
            className="dark fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-hidden p-6 outline-none"
          >
            {member && index !== null && (
              <>
                <DialogPrimitive.Title className="sr-only">
                  {member.name}
                </DialogPrimitive.Title>
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2.5">
                  <span className="hidden text-caption text-muted-foreground sm:inline">
                    Esc
                  </span>
                  <DialogPrimitive.Close
                    aria-label="Close"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-foreground transition-colors outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </DialogPrimitive.Close>
                </div>

                <div
                  style={{ width: STAGE_SIZE, height: STAGE_SIZE }}
                  className="relative shrink-0"
                >
                  <div
                    onPointerDown={(event) => {
                      if (event.pointerType === "mouse" && event.button !== 0) {
                        return;
                      }
                      const pressed =
                        event.target instanceof Element
                          ? event.target.closest<HTMLElement>(
                              "[data-ring-offset]",
                            )
                          : null;
                      const stageWidth =
                        event.currentTarget.getBoundingClientRect().width;
                      dragRef.current = {
                        pointerId: event.pointerId,
                        anchorX: event.clientX,
                        firstStepPx: stageWidth * FIRST_STEP_RATIO,
                        nextStepPx: stageWidth * NEXT_STEP_RATIO,
                        stepped: false,
                        travelled: 0,
                        pressedOffset: Number(pressed?.dataset.ringOffset ?? 0),
                      };
                      setDragging(true);
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className="absolute inset-0 touch-pan-y select-none"
                  >
                    {members.map((item, itemIndex) => {
                      const offset = ringOffset(
                        itemIndex,
                        index,
                        members.length,
                      );
                      if (Math.abs(offset) > RENDER_RANGE) return null;
                      const isCurrent = offset === 0;
                      return (
                        <div
                          key={item.slug}
                          data-crew-preview={isCurrent ? "" : undefined}
                          data-ring-offset={offset}
                          aria-hidden={!isCurrent}
                          style={cardStyle(offset, fanned)}
                          className={cn(
                            "absolute inset-0 overflow-hidden rounded-lg bg-muted shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/10",
                            "transition-[transform,opacity,filter] ease-[cubic-bezier(0.2,0,0,1)]",
                            dragging ? "duration-300" : "duration-500",
                            !isCurrent && "cursor-(--cursor-link)",
                          )}
                        >
                          <Image
                            src={crewPhotoSrc(item.slug)}
                            alt={isCurrent ? item.name : ""}
                            fill
                            unoptimized
                            draggable={false}
                            className="object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute top-full left-0 mt-6 flex w-full items-start justify-between gap-4 border-t border-white/10 pt-3">
                    <div
                      aria-live="polite"
                      className="flex min-w-0 flex-col gap-0.5"
                    >
                      <span className="truncate text-label text-foreground">
                        {member.name}
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {member.lines.join(" · ")}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <StepButton
                        label="Previous photo"
                        disabled={members.length < 2}
                        onClick={() => step(-1)}
                      >
                        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                      </StepButton>
                      <span className="tabular min-w-10 text-center text-caption text-muted-foreground">
                        {index + 1} / {members.length}
                      </span>
                      <StepButton
                        label="Next photo"
                        disabled={members.length < 2}
                        onClick={() => step(1)}
                      >
                        <ChevronRight className="h-4 w-4" strokeWidth={2} />
                      </StepButton>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </OpenCrewPhotoContext>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-white/15 text-foreground transition-colors outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-gold disabled:invisible"
    >
      {children}
    </button>
  );
}
