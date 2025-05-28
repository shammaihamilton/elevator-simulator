
import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useSimulationStore } from "@/store/simulationStore";
import { buildingFieldSchema } from "@/config/buildingFieldSchema";
import styles from "./BuildingConfigDialog.module.scss";
import FormSection from "../common/FormSection";
import NumberField from "../common/NumberField";
import SelectField from "../common/SelectField";
import { DispatchStrategy } from "@/types/enums/dispatchStrategy.enums";

export type BuildingFormData = {
  floorsPerBuilding: number;
  elevatorsPerBuilding: number;
  initialElevatorFloor: number;
  doorOpenTimeMs: number;
  doorTransitionTimeMs: number;
  floorTravelTimeMs: number;
  delayPerFloorMs: number;
  dispatchStrategy: DispatchStrategy | null;
};

interface BuildingConfigDialogProps {
  buildingIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const BuildingConfigDialog: React.FC<BuildingConfigDialogProps> = ({
  buildingIndex,
  isOpen,
  onClose,
}) => {
  const globalSettings = useSimulationStore((s) => s.settings);
  const updateBuildingSettings = useSimulationStore(
    (s) => s.updateBuildingSettings
  );
  const specificBuildingSettings = useSimulationStore(
    (s) => s.buildingSpecificSettings?.[buildingIndex] ?? null
  );

  const getEffective = useCallback<() => BuildingFormData>(
    () => ({
      floorsPerBuilding: globalSettings.buildings.floorsPerBuilding,
      elevatorsPerBuilding: globalSettings.buildings.elevatorsPerBuilding,
      initialElevatorFloor: globalSettings.buildings.initialElevatorFloor,
      doorOpenTimeMs: globalSettings.timing.doorOpenTimeMs,
      doorTransitionTimeMs: globalSettings.timing.doorTransitionTimeMs,
      floorTravelTimeMs: globalSettings.timing.floorTravelTimeMs,
      delayPerFloorMs: globalSettings.timing.delayPerFloorMs,
      dispatchStrategy: globalSettings.buildings.dispatchStrategy,
      ...specificBuildingSettings,
    }),
    [globalSettings, specificBuildingSettings]
  );

  const [formData, setFormData] = useState<BuildingFormData>(getEffective());

  useEffect(() => {
    if (isOpen) setFormData(getEffective());
  }, [isOpen, getEffective]);

  const handleChange = (key: keyof BuildingFormData, value: number) => {
    setFormData((fd) => ({ ...fd, [key]: value }));
  };

  const handleDispatchStrategyChange = (value: string) => {
    setFormData((fd) => ({ ...fd, dispatchStrategy: value as DispatchStrategy }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get current effective settings to compare
    const currentEffective = getEffective();
    
    // Ensure dispatchStrategy is never null
    const settingsToUpdate = {
      ...formData,
      dispatchStrategy: formData.dispatchStrategy || DispatchStrategy.ETA_ONLY
    };
    
    // Check if dispatch strategy changed
    const dispatchStrategyChanged = currentEffective.dispatchStrategy !== settingsToUpdate.dispatchStrategy;
    
    // Update building settings first
    updateBuildingSettings(buildingIndex, settingsToUpdate);
    
    // If dispatch strategy changed, apply it immediately to the specific building's manager
    if (dispatchStrategyChanged) {
      // Get the manager for this specific building and update its dispatch strategy
      const managers = useSimulationStore.getState().managers;
      const manager = managers[buildingIndex];
      
      if (manager && manager.setDispatchStrategy && typeof manager.setDispatchStrategy === "function") {
        console.log(`Setting dispatch strategy for building ${buildingIndex + 1} to ${settingsToUpdate.dispatchStrategy}`);
        manager.setDispatchStrategy(settingsToUpdate.dispatchStrategy);
      }
    }
    
    onClose();
  };

  const handleReset = () => {
    updateBuildingSettings(buildingIndex, null);
    onClose();
  };

  // Get dispatch strategy options
  const dispatchStrategyOptions = Object.values(DispatchStrategy).map(strategy => ({
    value: strategy,
    label: strategy
  }));

  return (
    <Dialog open={isOpen} onClose={onClose} className={styles.dialog}>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.wrapper}>
        <DialogPanel className={styles.panel}>
          <DialogTitle className={styles.title}>
            Building {buildingIndex + 1} Configuration
          </DialogTitle>
          <p className={styles.description}>
            Customize building-specific and timing parameters.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {(["buildingParams", "timingParams"] as const).map((section) => (
              <FormSection
                key={section}
                title={
                  section === "buildingParams"
                    ? "Building Parameters"
                    : "Timing Parameters"
                }
                className={styles.section}
                contentClassName={styles.fields}
              >
                {buildingFieldSchema[section].map((def) => {
                  // Check if the key exists in formData and ensure it's a number
                  const fieldValue = formData[def.key];
                  const numericValue = typeof fieldValue === "number" ? fieldValue : 0;
                  
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
                {section === "buildingParams" && (
                  <SelectField
                    label="Dispatch Strategy"
                    value={formData.dispatchStrategy || ""}
                    options={dispatchStrategyOptions}
                    onChange={handleDispatchStrategyChange}
                  />
                )}
              </FormSection>
            ))}

            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleReset}
                className={styles.cancel}
              >
                Reset to Global
              </button>
              <button type="submit" className={styles.apply}>
                Apply
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default BuildingConfigDialog;