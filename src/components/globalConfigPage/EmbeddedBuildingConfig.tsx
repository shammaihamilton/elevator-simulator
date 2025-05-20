// src/components/globalConfigPage/EmbeddedBuildingConfig.tsx
import React, { useEffect, useState, useCallback } from "react";
import { buildingFieldSchema } from "@/config/buildingFieldSchema";
// import FormSection from "../common/FormSection";
import NumberField from "../common/NumberField";
import styles from "./EmbeddedBuildingConfig.module.scss"; // You'll need to create this SCSS file
import { BuildingFormData } from "../buildingConfigDialog/BuildingConfigDialog"; // Assuming type is exported or move to shared

interface EmbeddedBuildingConfigProps {
  buildingIndex: number;
  currentOverride: BuildingFormData | null;
  globalDefaults: BuildingFormData;
  onOverrideChange: (buildingIndex: number, data: BuildingFormData) => void;
  onResetToGlobal: (buildingIndex: number) => void;
}

const EmbeddedBuildingConfig: React.FC<EmbeddedBuildingConfigProps> = ({
  buildingIndex,
  currentOverride,
  globalDefaults,
  onOverrideChange,
  onResetToGlobal,
}) => {
  const getInitialFormData = useCallback(() => {
    return currentOverride ? { ...currentOverride } : { ...globalDefaults };
  }, [currentOverride, globalDefaults]);

  const [formData, setFormData] = useState<BuildingFormData>(getInitialFormData());

  useEffect(() => {
    setFormData(getInitialFormData());
  }, [getInitialFormData]);

  const handleChange = (key: keyof BuildingFormData, value: number) => {
    const newFormData = { ...formData, [key]: value };
    setFormData(newFormData);
    onOverrideChange(buildingIndex, newFormData);
  };

  const handleResetClick = () => {
    onResetToGlobal(buildingIndex);
  };

  const isCustomized = currentOverride !== null;

  return (
    <div className={styles.embeddedConfigWrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Building {buildingIndex + 1} Configuration
        </h3>
        {isCustomized && (
          <span className={styles.customBadge}>(Customized)</span>
        )}
        <button
          type="button"
          onClick={handleResetClick}
          className={styles.resetButton}
          disabled={!isCustomized}
        >
          Reset to Global Defaults
        </button>
      </div>

      <div className={styles.formGrid}>
        {(["buildingParams", "timingParams"] as const).map((sectionKey) => (
          <div key={sectionKey} className={styles.formSectionContainer}>
            <h4 className={styles.sectionTitle}>
              {sectionKey === "buildingParams"
                ? "Building Parameters"
                : "Timing Parameters (ms)"}
            </h4>
            <div className={styles.fieldsGrid}>
              {buildingFieldSchema[sectionKey].map((def) => (
                <NumberField
                  key={def.key}
                  label={def.label}
                  min={def.min}
                  step={def.step}
                  value={formData[def.key]}
                  onChange={(val) => handleChange(def.key, val)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmbeddedBuildingConfig;
