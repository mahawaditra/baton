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
    photoDriveFileId: "1g6miUEY7duO7hwa_3ZUcn5o7yqN3MBwW",
    mimeType: "image/webp",
  },
  {
    slug: "ammar",
    name: "Ammar",
    lines: ["Clarinet '20", "Honorary"],
    photoDriveFileId: "1feFzK-JgXb2EOBAONvobiyXaGwI24VBy",
    mimeType: "image/webp",
  },
  {
    slug: "metsyuu",
    name: "Metsyuu",
    lines: ["Percussion '22", "Honorary"],
    photoDriveFileId: "1Cba2C0rm_hHotQR25SyeuK7GOZhqjsbe",
    mimeType: "image/webp",
  },
  {
    slug: "bamjo",
    name: "BAMJO",
    lines: ["Contrabass '19", "Kadiv '21"],
    photoDriveFileId: "1KvGP88FL2X0BCAcBoH5hIENw0NoR2vSy",
    mimeType: "image/webp",
  },
  {
    slug: "kenichi",
    name: "Kenichi",
    lines: ["Cello '20", "Kadiv '22"],
    photoDriveFileId: "11_aNwj5BIqy_Mo-amQ2Eu6VkiFDwK21F",
    mimeType: "image/webp",
  },
  {
    slug: "faris",
    name: "Faris",
    lines: ["Percussion '21", "Kadiv '24"],
    photoDriveFileId: "1kHmrIKWG-prXdLUi8AHSSBOcLVbsXWr3",
    mimeType: "image/webp",
  },
  {
    slug: "sudirman-meltdown",
    name: "Sudirman Meltdown",
    lines: ["Viola '19", "Honorary"],
    photoDriveFileId: "1H0aaNX5DFAFiBbQAI_ttcmYxOH-UqQGv",
    mimeType: "image/webp",
  },
  {
    slug: "alvin",
    name: "Alvin",
    lines: ["Bassoon '19", "Wakadiv '21"],
    photoDriveFileId: "1we2piAC11wLwo_eT9LGUTwsYFKMvcgfL",
    mimeType: "image/webp",
  },
];

export const LEGACY_CREW_IMAGE_TYPES = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
