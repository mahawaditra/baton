"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyForm } from "./SurveyForm";

export function SurveySection({
  ticketId,
  accessCode,
  hasFilledSurvey,
  onSubmitted,
}: {
  ticketId: string;
  accessCode: string;
  hasFilledSurvey: boolean;
  onSubmitted: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = useCallback(() => {
    setIsOpen(false);
    onSubmitted();
  }, [onSubmitted]);

  if (hasFilledSurvey) {
    return (
      <Card key="thanks" className="survey-enter">
        <CardHeader>
          <CardTitle>Makasih udah ngisi survey!</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isOpen) {
    return (
      <SurveyForm
        ticketId={ticketId}
        accessCode={accessCode}
        onSuccess={handleSuccess}
        onCancel={() => setIsOpen(false)}
      />
    );
  }

  return (
    <Card key="invite" className="survey-enter">
      <CardHeader>
        <CardTitle>Bantu kami jadi lebih baik</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-body text-foreground-2">
          Survey singkat dan opsional, dua halaman: soal BATON dan soal
          Logistik. Jawabanmu nggak ditautkan ke tiketmu.
        </p>
        <div>
          <Button variant="outline" onClick={() => setIsOpen(true)}>
            Isi Survey
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
