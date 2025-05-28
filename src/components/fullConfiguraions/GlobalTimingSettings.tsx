
// components/GlobalTimingSettings.tsx
import React from "react";
import FormSection from "../common/FormSection";
import NumberField from "../common/NumberField";
import { AppSettings } from "@/config/settingsSchema";

interface GlobalTimingSettingsProps {
  formData: AppSettings;
  onChange: <S extends keyof AppSettings>(
    section: S,
    field: keyof AppSettings[S],
    value: number
  ) => void;
}

const GlobalTimingSettings: React.FC<GlobalTimingSettingsProps> = ({
  formData,
  onChange,
}) => {
  return (
    <FormSection title="Global Timing Settings (defaults)">
      <NumberField
        label="Door Open Time (ms)"
        value={formData.timing.doorOpenTimeMs}
        min={100}
        onChange={(v) => onChange("timing", "doorOpenTimeMs", v)}
      />
      <NumberField
        label="Delay per Floor (ms)"
        value={formData.timing.delayPerFloorMs}
        min={100}
        onChange={(v) => onChange("timing", "delayPerFloorMs", v)}
      />
      <NumberField
        label="Door Transition Time (ms)"
        value={formData.timing.doorTransitionTimeMs}
        min={100}
        onChange={(v) => onChange("timing", "doorTransitionTimeMs", v)}
      />
      <NumberField
        label="Floor Travel Time (ms)"
        value={formData.timing.floorTravelTimeMs}
        min={100}
        onChange={(v) => onChange("timing", "floorTravelTimeMs", v)}
      />
    </FormSection>
  );
};

export default GlobalTimingSettings;
