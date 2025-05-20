import { AppSettings } from "@/interfaces";
import { SettingsSchema } from "@/config/settingsSchema";




export default function loadSettingsFromLocalStorage(): AppSettings {
  const storedSettingsJson = localStorage.getItem("appSettings");
  if (storedSettingsJson) {
    try {
      const rawSettings = JSON.parse(storedSettingsJson);
      return SettingsSchema.parse(rawSettings); // Validate and apply defaults for missing fields
    } catch (error) {
      console.warn("Failed to parse settings from localStorage, using defaults.", error);
    }
  }
  return SettingsSchema.parse({}); // Return defaults if nothing stored or parsing failed
}


