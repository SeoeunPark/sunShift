export type ShareScheduleResult = "shared" | "downloaded" | "copied" | "unsupported";

export function isWebShareSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function canShareFiles(file: File): boolean {
  if (!isWebShareSupported() || !navigator.canShare) {
    return false;
  }

  return navigator.canShare({ files: [file] });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function shareScheduleContent(options: {
  title: string;
  text: string;
  imageBlob: Blob;
  filename: string;
}): Promise<ShareScheduleResult> {
  const file = new File([options.imageBlob], options.filename, { type: "image/png" });

  if (canShareFiles(file)) {
    await navigator.share({
      title: options.title,
      text: options.text,
      files: [file],
    });
    return "shared";
  }

  if (isWebShareSupported()) {
    await navigator.share({
      title: options.title,
      text: options.text,
    });
    return "shared";
  }

  downloadBlob(options.imageBlob, options.filename);

  const copied = await copyTextToClipboard(options.text);
  return copied ? "copied" : "downloaded";
}
