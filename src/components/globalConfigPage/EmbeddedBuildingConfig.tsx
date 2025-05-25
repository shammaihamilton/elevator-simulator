
import React, { useEffect, useState, useCallback } from "react";
import { buildingFieldSchema } from "@/config/buildingFieldSchema";
import NumberField from "../common/NumberField";
import SelectField from "../common/SelectField";
import styles from "./EmbeddedBuildingConfig.module.scss";
import { BuildingFormData } from "../buildingConfigDialog/BuildingConfigDialog";
import CustomSettingsBadge from "../common/CustomSettingsBadge";
import { DispatchStrategy } from "@/types/enums/dispatchStrategy.enums";

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

  const [formData, setFormData] = useState<BuildingFormData>(
    getInitialFormData()
  );

  useEffect(() => {
    setFormData(getInitialFormData());
  }, [getInitialFormData]);

  const handleChange = (key: keyof BuildingFormData, value: number) => {
    const newFormData = { ...formData, [key]: value };
    setFormData(newFormData);
    onOverrideChange(buildingIndex, newFormData);
  };

  const handleDispatchStrategyChange = (value: string) => {
    const newFormData = {
      ...formData,
      dispatchStrategy: value as DispatchStrategy,
    };
    setFormData(newFormData);
    onOverrideChange(buildingIndex, newFormData);
  };

  const handleResetClick = () => {
    onResetToGlobal(buildingIndex);
  };

  const isCustomized = currentOverride !== null;

  // Get dispatch strategy options
  const dispatchStrategyOptions = Object.values(DispatchStrategy).map(
    (strategy) => ({
      value: strategy,
      label: strategy,
    })
  );

  return (
    <div className={styles.embeddedConfigWrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Building {buildingIndex + 1} Configuration
        </h3>
        {isCustomized && (
          <CustomSettingsBadge
            buildingIndex={buildingIndex}
            style={styles.customBadge}
          />
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
              {buildingFieldSchema[sectionKey].map((def) => {
                // Check if the key exists in formData
                const fieldValue = formData[def.key];
                const numericValue =
                  typeof fieldValue === "number" ? fieldValue : 0;

                return (
                  <NumberField
                    key={def.key}
                    label={def.label}
                    min={def.min}
                    step={def.step}
                    value={numericValue}
                    onChange={(val) => handleChange(def.key, val)}
                  />
                );
              })}
              {/* Add dispatch strategy field to building params section */}
              {sectionKey === "buildingParams" && (
                <SelectField
                  label="Dispatch Strategy"
                  value={formData.dispatchStrategy || ""}
                  options={dispatchStrategyOptions}
                  onChange={handleDispatchStrategyChange}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmbeddedBuildingConfig;
