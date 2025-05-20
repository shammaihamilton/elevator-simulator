import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useSimulationStore } from "@/store/simulationStore";
import { buildingFieldSchema } from "@/config/buildingFieldSchema";
import styles from "./BuildingConfigDialog.module.scss";
import FormSection from "../common/FormSection";
import NumberField from "../common/NumberField";

export type BuildingFormData = {
  floorsPerBuilding: number;
  elevatorsPerBuilding: number;
  initialElevatorFloor: number;
  doorOpenTimeMs: number;
  doorTransitionTimeMs: number;
  floorTravelTimeMs: number;
  delayPerFloorMs: number;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBuildingSettings(buildingIndex, formData);
    onClose();
  };

  const handleReset = () => {
    updateBuildingSettings(buildingIndex, null);
    onClose();
  };

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
                contentClassName={styles.fields} // <-- apply your grid here
              >
                {buildingFieldSchema[section].map((def) => (
                  <NumberField
                    key={def.key}
                    label={def.label}
                    min={def.min}
                    step={def.step}
                    value={formData[def.key]}
                    onChange={(val) => handleChange(def.key, val)}
                  />
                ))}
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
