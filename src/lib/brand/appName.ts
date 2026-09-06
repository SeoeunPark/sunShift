/** Visible branding with a normal space. */
export const APP_DISPLAY_NAME = "SUN shift";

/**
 * iOS Safari may split `document.title` on spaces and suggest only part of the name
 * (e.g. "shift"). A non-breaking space keeps "SUN shift" intact on Add to Home Screen.
 */
export const APP_IOS_HOME_SCREEN_NAME = "SUN\u00A0shift";
