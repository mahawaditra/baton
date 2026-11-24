export type NavGroup = {
  id: string;
  title: string;
  items: { id: string; title: string }[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "foundations",
    title: "Foundations",
    items: [
      { id: "colour", title: "Colour" },
      { id: "typography", title: "Typography" },
      { id: "shape", title: "Radius & shadow" },
      { id: "motion", title: "Motion" },
      { id: "pointer", title: "Cursor & scrollbar" },
      { id: "glyphs", title: "Music glyphs" },
    ],
  },
  {
    id: "components",
    title: "Components",
    items: [
      { id: "notice", title: "Notice" },
      { id: "field", title: "Field" },
      { id: "badges", title: "Badges" },
      { id: "ticket", title: "Ticket" },
      { id: "progress", title: "Progress" },
      { id: "disclosure", title: "Disclosure & collapse" },
      { id: "confirmation", title: "Confirmation" },
      { id: "empty-state", title: "Empty state" },
      { id: "toast", title: "Toast" },
      { id: "segmented", title: "Segmented control" },
      { id: "cards", title: "Cards" },
    ],
  },
  {
    id: "guidelines",
    title: "Guidelines",
    items: [
      { id: "writing", title: "Writing" },
      { id: "accessibility", title: "Accessibility" },
    ],
  },
];
