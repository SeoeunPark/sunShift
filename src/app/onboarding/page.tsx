"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ShiftSetupForm } from "@/components/onboarding/ShiftSetupForm";
import { PageHeader } from "@/components/ui/PageHeader";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "1";

  return (
    <div className="flex flex-col gap-6 py-6">
      <PageHeader
        title={isEdit ? "교대 설정" : "내 교대 설정"}
        description={isEdit ? undefined : "몇 조인지만 선택해 주세요."}
      />
      <ShiftSetupForm mode={isEdit ? "edit" : "onboarding"} />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
