import { SettingsSchema, AppSettings } from './settingsSchema';

/**
 * Load runtime overrides (e.g. from env, file, UI). Replace with your own loader.
 */
function loadOverrides(): Partial<unknown> {
  // Example: parse JSON or read process.env
  return {};
}

/**
 * Parse and validate settings at startup
 */
export const appSettings: AppSettings = SettingsSchema.parse(
  loadOverrides()
);