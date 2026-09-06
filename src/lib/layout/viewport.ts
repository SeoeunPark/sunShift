/** Fixed bottom nav height (pill + outer padding, excluding safe-area). */
export const BOTTOM_NAV_HEIGHT = "5.75rem";

/** Scroll padding so main content clears the fixed bottom nav. */
export const BOTTOM_NAV_RESERVE =
  "pb-[calc(5.75rem+env(safe-area-inset-bottom))]";

/** Header (~3rem) + bottom nav for viewport-fitted pages. */
export const PAGE_CHROME_HEIGHT = "8.75rem";

/** Main content area below header + above bottom nav (iPhone-safe). */
export const PAGE_VIEWPORT_HEIGHT =
  "h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-8.75rem)]";

/** Offset for floating banners above the bottom nav. */
export const BOTTOM_NAV_BANNER_OFFSET =
  "bottom-[calc(5.75rem+env(safe-area-inset-bottom))]";
