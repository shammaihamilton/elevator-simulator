
// components/GlobalSimulationSettings.tsx
import React from "react";
import FormSection from "../common/FormSection";
import NumberField from "../common/NumberField";
import { AppSettings } from "@/config/settingsSchema";
import styles from "./GlobalConfigPage.module.scss";

interface GlobalSimulationSettingsProps {
  formData: AppSettings;
  onChange: <S extends keyof AppSettings>(
    section: S,
    field: keyof AppSettings[S],
    value: number
  ) => void;
}

const GlobalSimulationSettings: React.FC<GlobalSimulationSettingsProps> = ({
  formData,
  onChange,
}) => {
  return (
    <FormSection
      title="Global Simulation Settings"
      className={styles.simulationSection}
    >
      <NumberField
        label="Simulation Tick (ms)"
        value={formData.simulation.simulationTickMs}
        min={10}
        onChange={(v) => onChange("simulation", "simulationTickMs", v)}
      />
      <NumberField
        label="Simulation Speed Factor"
        value={formData.simulation.simulationSpeedFactor}
        min={0.1}
        step={0.1}
        onChange={(v) => onChange("simulation", "simulationSpeedFactor", v)}
      />
    </FormSection>
  );
};

export default GlobalSimulationSettings;
