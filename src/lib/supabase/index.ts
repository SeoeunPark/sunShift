export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient } from "./server";
export { isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey } from "./config";
export {
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
  signOut,
  deleteAccount,
} from "./auth";
export {
  mapShiftDefinitions,
  mapShiftSettingsRow,
  mapShiftSettingsToRow,
  mapShiftDefinitionToRow,
} from "./mappers";
