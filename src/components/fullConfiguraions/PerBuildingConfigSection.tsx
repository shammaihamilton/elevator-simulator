
// components/PerBuildingConfigSection.tsx
import React from "react";
import EmbeddedBuildingConfig from "./EmbeddedBuildingConfig";
import { BuildingFormData } from "../buildingConfigDialog/BuildingConfigDialog";
import styles from "./GlobalConfigPage.module.scss";

interface PerBuildingConfigSectionProps {
  numberOfBuildings: number;
  localBuildingOverrides: Record<number, BuildingFormData | null>;
  globalDefaults: BuildingFormData;
  onOverrideChange: (index: number, data: BuildingFormData | null) => void;
  onResetToGlobal: (index: number) => void;
}

const PerBuildingConfigSection: React.FC<PerBuildingConfigSectionProps> = ({
  numberOfBuildings,
  localBuildingOverrides,
  globalDefaults,
  onOverrideChange,
  onResetToGlobal,
}) => {
  if (numberOfBuildings <= 1) {
    return null;
  }

  return (
    <div className={styles.perBuildingSection}>
      <h2 className={styles.subHeader}>
        Per-Building Specific Configurations
      </h2>
      {Array.from({ length: numberOfBuildings }).map((_, index) => (
        <EmbeddedBuildingConfig
          key={index}
          buildingIndex={index}
          currentOverride={localBuildingOverrides[index] || null}
          globalDefaults={globalDefaults}
          onOverrideChange={onOverrideChange}
          onResetToGlobal={onResetToGlobal}
        />
      ))}
    </div>
  );
};

export default PerBuildingConfigSection;