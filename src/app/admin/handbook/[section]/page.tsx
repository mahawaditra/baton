import { notFound } from "next/navigation";
import { HANDBOOK_SECTIONS } from "../sections";
import { OnboardingSection } from "../OnboardingSection";
import { WorkflowSection } from "../WorkflowSection";
import { DailiesSection } from "../DailiesSection";
import { SeasonalChoreSection } from "../SeasonalChoreSection";
import { TroubleshootingSection } from "../TroubleshootingSection";

export default async function HandbookSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const known = HANDBOOK_SECTIONS.some((s) => s.slug === section);
  if (!known) notFound();

  if (section === "onboarding") return <OnboardingSection />;
  if (section === "workflow") return <WorkflowSection />;
  if (section === "dailies") return <DailiesSection />;
  if (section === "seasonal-chore") return <SeasonalChoreSection />;
  if (section === "troubleshooting") return <TroubleshootingSection />;
  notFound();
}
