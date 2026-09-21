export type LegacyCrewMember = {
  slug: string;
  name: string;
  lines: string[];
  featured?: boolean;
  photoDriveFileId: string | null;
  mimeType: string;
};

export const LEGACY_CREW: LegacyCrewMember[] = [
  {
    slug: "haseulbintaro",
    name: "Haseulbintaro",
    lines: [
      "Percussion '20",
      "Wakadiv '22 & Kadiv '23",
      "BATON sole developer",
    ],
    featured: true,
    photoDriveFileId: "1NHum1ddcA7o8RnsyL6Z1n-KBMXBWNj_9",
    mimeType: "image/gif",
  },
  {
    slug: "adit",
    name: "Adit",
    lines: ["Percussion '20", "Wakadiv '23"],
    photoDriveFileId: "1hkCCvEdu_HaDETuCjQpiidCh2Ql7q3oT",
    mimeType: "image/jpeg",
  },
  {
    slug: "ammar",
    name: "Ammar",
    lines: ["Clarinet '20", "Honorary"],
    photoDriveFileId: "1tAGWuEHTauEKA3v_8ZrGpMB8gtg4y4mZ",
    mimeType: "image/jpeg",
  },
  {
    slug: "metsyuu",
    name: "Metsyuu",
    lines: ["Percussion '22", "Honorary"],
    photoDriveFileId: "1AWLT2jT17jlsQBfogOsihh8BcseZfZht",
    mimeType: "image/jpeg",
  },
  {
    slug: "bamjo",
    name: "BAMJO",
    lines: ["Contrabass '19", "Kadiv '21"],
    photoDriveFileId: "1hiQK4ax9EKNWK0Y9ZiTNRnfKAZXcMUdd",
    mimeType: "image/jpeg",
  },
  {
    slug: "kenichi",
    name: "Kenichi",
    lines: ["Cello '20", "Kadiv '22"],
    photoDriveFileId: "1ptG5v57fZLUlEqWZgsFFlknLe9jJED7C",
    mimeType: "image/jpeg",
  },
  {
    slug: "faris",
    name: "Faris",
    lines: ["Percussion '21", "Kadiv '24"],
    photoDriveFileId: "1eCYM51B6Kkt-DgU5WAU_hUp7QMkFdSbE",
    mimeType: "image/jpeg",
  },
  {
    slug: "sudirman-meltdown",
    name: "Sudirman Meltdown",
    lines: ["Viola '19", "Honorary"],
    photoDriveFileId: "1wIYLG90GlhFQ50B2vbCILO1AAZ9zTUtY",
    mimeType: "image/jpeg",
  },
  {
    slug: "alvin",
    name: "Alvin",
    lines: ["Bassoon '19", "Wakadiv '21"],
    photoDriveFileId: "11ChbgP6M1Wa7Lzm5AFZ2mQqds-F-u91a",
    mimeType: "image/jpeg",
  },
];

export const LEGACY_CREW_IMAGE_TYPES = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
