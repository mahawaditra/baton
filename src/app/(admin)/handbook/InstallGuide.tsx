"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/SegmentedControl";

const PLATFORMS = [
  { id: "android", label: "Android" },
  { id: "ios", label: "iOS" },
] as const;

const STEPS: Record<(typeof PLATFORMS)[number]["id"], string[]> = {
  android: [
    "Klik menu (titik 3 di kanan atas or something like that).",
    'Pilih "Add to Home Screen".',
    'Kalo ditanya as shortcut or app, pilih "app".',
  ],
  ios: [
    "Buka di Safari.",
    "Klik Share (kotak dengan panah ke atas).",
    'Pilih "Add to Home Screen".',
  ],
};

export function InstallGuide() {
  const [platform, setPlatform] =
    useState<(typeof PLATFORMS)[number]["id"]>("android");

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        ariaLabel="Perangkat"
        options={PLATFORMS}
        value={platform}
        onChange={setPlatform}
        className="w-full sm:w-fit"
      />
      <ol key={platform} data-stagger className="list-decimal pl-5">
        {STEPS[platform].map((step) => (
          <li key={step} className="py-0.5">
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
