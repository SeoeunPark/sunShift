"use client";

import { useCallback, useState } from "react";
import { createScheduleShareImage } from "@/lib/share/scheduleImage";
import {
  formatScheduleShareText,
  formatScheduleShareTitle,
  type ScheduleShareInput,
} from "@/lib/share/scheduleText";
import {
  canShareFiles,
  downloadBlob,
  shareScheduleContent,
  type ShareScheduleResult,
} from "@/lib/share/shareSchedule";

const RESULT_MESSAGES: Record<ShareScheduleResult, string> = {
  shared: "근무표를 공유했습니다.",
  downloaded: "근무표 이미지를 저장했습니다.",
  copied: "근무표 이미지를 저장하고 텍스트를 복사했습니다.",
  unsupported: "이 브라우저에서는 공유를 지원하지 않습니다.",
};

export function useShareSchedule() {
  const [isSharing, setIsSharing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const share = useCallback(async (input: ScheduleShareInput) => {
    setIsSharing(true);
    setMessage(null);

    const title = formatScheduleShareTitle(input.year, input.month);
    const text = formatScheduleShareText(input);
    const filename = `shift-${input.year}-${String(input.month).padStart(2, "0")}.png`;

    try {
      const imageBlob = await createScheduleShareImage(input);
      const result = await shareScheduleContent({
        title,
        text,
        imageBlob,
        filename,
      });

      setMessage(RESULT_MESSAGES[result]);
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessage("공유가 취소되었습니다.");
        return "unsupported" as const;
      }

      try {
        const imageBlob = await createScheduleShareImage(input);
        downloadBlob(imageBlob, filename);
        setMessage("공유에 실패해 이미지를 저장했습니다.");
        return "downloaded" as const;
      } catch {
        setMessage(error instanceof Error ? error.message : "공유에 실패했습니다.");
        throw error;
      }
    } finally {
      setIsSharing(false);
    }
  }, []);

  const download = useCallback(async (input: ScheduleShareInput) => {
    setIsSharing(true);
    setMessage(null);

    try {
      const imageBlob = await createScheduleShareImage(input);
      const filename = `shift-${input.year}-${String(input.month).padStart(2, "0")}.png`;
      const file = new File([imageBlob], filename, { type: "image/png" });

      if (canShareFiles(file)) {
        await navigator.share({ files: [file] });
        setMessage("공유 메뉴에서 사진 앱에 저장할 수 있습니다.");
        return;
      }

      downloadBlob(imageBlob, filename);
      setMessage("근무표 이미지를 저장했습니다.");
    } finally {
      setIsSharing(false);
    }
  }, []);

  return {
    share,
    download,
    isSharing,
    message,
  };
}
