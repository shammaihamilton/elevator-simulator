// components/GlobalBuildingSettings.tsx
import React from "react";
import FormSection from "../common/FormSection";
import NumberField from "../common/NumberField";
import SelectField from "../common/SelectField";
import { AppSettings } from "@/config/settingsSchema";
import { DispatchStrategy } from "@/types/enums/dispatchStrategy.enums";

interface GlobalBuildingSettingsProps {
  formData: AppSettings;
  onChange: <S extends keyof AppSettings>(
    section: S,
    field: keyof AppSettings[S],
    value: number
  ) => void;
  onDispatchStrategyChange: (value: string) => void;
}

const GlobalBuildingSettings: React.FC<GlobalBuildingSettingsProps> = ({
  formData,
  onChange,
  onDispatchStrategyChange,
}) => {
  const dispatchStrategyOptions = Object.values(DispatchStrategy).map(strategy => ({
    value: strategy,
    label: strategy
  }));

  return (
    <FormSection title="Global Building Settings">
      <NumberField
        label="Number of Buildings"
        value={formData.buildings.numberOfBuildings}
        min={1}
        onChange={(v) => onChange("buildings", "numberOfBuildings", v)}
      />
      <NumberField
        label="Default Floors per Building"
        value={formData.buildings.floorsPerBuilding}
        min={2}
        onChange={(v) => onChange("buildings", "floorsPerBuilding", v)}
      />
      <NumberField
        label="Default Elevators per Building"
        value={formData.buildings.elevatorsPerBuilding}
        min={1}
        onChange={(v) => onChange("buildings", "elevatorsPerBuilding", v)}
      />
      <NumberField
        label="Default Initial Elevator Floor"
        value={formData.buildings.initialElevatorFloor}
        min={0}
        onChange={(v) => onChange("buildings", "initialElevatorFloor", v)}
      />
      <SelectField
        label="Default Dispatch Strategy"
        value={formData.buildings.dispatchStrategy}
        options={dispatchStrategyOptions}
        onChange={onDispatchStrategyChange}
      />
    </FormSection>
  );
};

export default GlobalBuildingSettings;
