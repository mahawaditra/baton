import { Compass, Workflow, ListChecks, CalendarRange, LifeBuoy } from "lucide-react";

export const HANDBOOK_SECTIONS = [
  { slug: "onboarding", title: "Onboarding", icon: Compass },
  { slug: "workflow", title: "Workflow", icon: Workflow },
  { slug: "dailies", title: "Dailies", icon: ListChecks },
  { slug: "seasonal-chore", title: "Seasonal Chore", icon: CalendarRange },
  { slug: "troubleshooting", title: "Troubleshooting", icon: LifeBuoy },
] as const;

export type HandbookSectionSlug = (typeof HANDBOOK_SECTIONS)[number]["slug"];
