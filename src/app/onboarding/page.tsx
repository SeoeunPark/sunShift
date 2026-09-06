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
        description={
          isEdit
            ? "조 번호, 기준일, 기준 근무조를 수정할 수 있습니다."
            : "교대 패턴 계산을 위해 아래 정보를 확인해 주세요."
        }
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
