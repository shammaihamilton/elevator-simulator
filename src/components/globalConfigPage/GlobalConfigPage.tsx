import React, { useState, useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import FormSection from "../common/FormSection";
import NumberField from "../common/NumberField";
import styles from "./GlobalConfigPage.module.scss";
import { useNavigate } from "react-router-dom";
import EmbeddedBuildingConfig from "./EmbeddedBuildingConfig";
import { BuildingFormData } from "../buildingConfigDialog/BuildingConfigDialog";
// import { AppSettings } from "@/interfaces";
import { SettingsSchema, AppSettings } from "@/config/settingsSchema"; // Use Zod-inferred AppSettings

const GlobalConfigPage: React.FC = () => {
  const [formErrors, setFormErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const navigate = useNavigate();
  const storeSettings = useSimulationStore((s) => s.settings);
  const storeBuildingSpecificSettings = useSimulationStore(
    (s) => s.buildingSpecificSettings
  );

  const updateSettings = useSimulationStore((s) => s.updateSettings);
  const updateBuildingSettings = useSimulationStore(
    (s) => s.updateBuildingSettings
  );


  const [formData, setFormData] = useState<AppSettings>(storeSettings as AppSettings);
  const [localBuildingOverrides, setLocalBuildingOverrides] = useState<
    Record<number, BuildingFormData | null>
  >({});

  useEffect(() => {

    const initialOverrides: Record<number, BuildingFormData | null> = {};
    const numBuildings = storeSettings.buildings.numberOfBuildings;

    const globalDefaultsForOverrides: BuildingFormData = {
      floorsPerBuilding: storeSettings.buildings.floorsPerBuilding,
      elevatorsPerBuilding: storeSettings.buildings.elevatorsPerBuilding,
      initialElevatorFloor: storeSettings.buildings.initialElevatorFloor,
      doorOpenTimeMs: storeSettings.timing.doorOpenTimeMs,
      doorTransitionTimeMs: storeSettings.timing.doorTransitionTimeMs,
      floorTravelTimeMs: storeSettings.timing.floorTravelTimeMs,
      delayPerFloorMs: storeSettings.timing.delayPerFloorMs,
    };

    for (let i = 0; i < numBuildings; i++) {
      const specific = storeBuildingSpecificSettings[i];
      if (specific) {
        initialOverrides[i] = { ...globalDefaultsForOverrides, ...specific };
      } else {
        initialOverrides[i] = null;
      }
    }
    const relevantOverrides: Record<number, BuildingFormData | null> = {};
    for (let i = 0; i < numBuildings; i++) {
      relevantOverrides[i] = initialOverrides.hasOwnProperty(i)
        ? initialOverrides[i]
        : null;
    }
    setLocalBuildingOverrides(relevantOverrides);
  }, [storeSettings, storeBuildingSpecificSettings]);

  const handleChange = <S extends keyof AppSettings>(
    section: S,
    field: keyof AppSettings[S],
    value: number
  ) => {
    setFormData((prevFormData) => {
      const currentSectionData = prevFormData[section];
      const newSectionData = {
        ...currentSectionData,
        [field]: value, // Type checking will occur here
      };
      const newFormData = {
        ...prevFormData,
        [section]: newSectionData,
      };

      return newFormData;
    });
  };

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({}); // Clear previous errors

    const parseResult = SettingsSchema.safeParse(formData);

    if (parseResult.success) {
      const validatedSettings: AppSettings = parseResult.data;
      updateSettings(validatedSettings); // Update store with Zod-validated and transformed settings

      const numBuildings = validatedSettings.buildings.numberOfBuildings;
      for (let i = 0; i < numBuildings; i++) {
        updateBuildingSettings(i, localBuildingOverrides[i] || null);
      }
      Object.keys(storeBuildingSpecificSettings).forEach((keyStr) => {
        const index = parseInt(keyStr, 10);
        if (index >= numBuildings) {
          updateBuildingSettings(index, null);
        }
      });
      navigate("/simulation");
    } else {

      const flattenedErrors = parseResult.error.flatten().fieldErrors;
      console.error("Global configuration errors:", flattenedErrors);
      setFormErrors(flattenedErrors as Record<string, string[] | undefined>);
    }
  };

  return (
    <div className={styles.globalConfig}>
      <h1 className={styles.header}>Global Configuration</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Global Building Settings: column 1 */}
        <FormSection title="Global Building Settings">
          <NumberField
            label="Number of Buildings"
            value={formData.buildings.numberOfBuildings}
            min={1}
            onChange={(v) => handleChange("buildings", "numberOfBuildings", v)}
          />
          <NumberField
            label="Default Floors per Building"
            value={formData.buildings.floorsPerBuilding}
            min={2}
            onChange={(v) => handleChange("buildings", "floorsPerBuilding", v)}
          />
          <NumberField
            label="Default Elevators per Building"
            value={formData.buildings.elevatorsPerBuilding}
            min={1}
            onChange={(v) =>
              handleChange("buildings", "elevatorsPerBuilding", v)
            }
          />
          <NumberField
            label="Default Initial Elevator Floor"
            value={formData.buildings.initialElevatorFloor}
            min={0}
            onChange={(v) =>
              handleChange("buildings", "initialElevatorFloor", v)
            }
          />
        </FormSection>

        {/* Timing Settings: column 2 */}
        <FormSection title="Global Timing Settings (defaults)">
          <NumberField
            label="Door Open Time (ms)"
            value={formData.timing.doorOpenTimeMs}
            min={100}
            onChange={(v) => handleChange("timing", "doorOpenTimeMs", v)}
          />
          <NumberField
            label="Delay per Floor (ms)"
            value={formData.timing.delayPerFloorMs}
            min={100}
            onChange={(v) => handleChange("timing", "delayPerFloorMs", v)}
          />
          <NumberField
            label="Door Transition Time (ms)"
            value={formData.timing.doorTransitionTimeMs}
            min={100}
            onChange={(v) => handleChange("timing", "doorTransitionTimeMs", v)}
          />
          <NumberField
            label="Floor Travel Time (ms)"
            value={formData.timing.floorTravelTimeMs}
            min={100}
            onChange={(v) => handleChange("timing", "floorTravelTimeMs", v)}
          />
        </FormSection>

        {/* Simulation Settings: spans both columns, but its two inputs sit side by side */}
        <FormSection
          title="Global Simulation Settings"
          className={styles.simulationSection}
        >
          <NumberField
            label="Simulation Tick (ms)"
            value={formData.simulation.simulationTickMs}
            min={10}
            onChange={(v) => handleChange("simulation", "simulationTickMs", v)}
          />
          <NumberField
            label="Simulation Speed Factor"
            value={formData.simulation.simulationSpeedFactor}
            min={0.1}
            step={0.1}
            onChange={(v) =>
              handleChange("simulation", "simulationSpeedFactor", v)
            }
          />
        </FormSection>
        {/* Per-Building Configuration Section */}
        {formData.buildings.numberOfBuildings > 1 && (
          <div className={styles.perBuildingSection}>
            <h2 className={styles.subHeader}>
              Per-Building Specific Configurations
            </h2>
            {Array.from({ length: formData.buildings.numberOfBuildings }).map(
              (_, index) => {
                const currentGlobalDefaultsForEmbedded: BuildingFormData = {
                  floorsPerBuilding: formData.buildings.floorsPerBuilding,
                  elevatorsPerBuilding: formData.buildings.elevatorsPerBuilding,
                  initialElevatorFloor: formData.buildings.initialElevatorFloor,
                  doorOpenTimeMs: formData.timing.doorOpenTimeMs,
                  doorTransitionTimeMs: formData.timing.doorTransitionTimeMs,
                  floorTravelTimeMs: formData.timing.floorTravelTimeMs,
                  delayPerFloorMs: formData.timing.delayPerFloorMs,
                };
                return (
                  <EmbeddedBuildingConfig
                    key={index}
                    buildingIndex={index}
                    currentOverride={localBuildingOverrides[index] || null}
                    globalDefaults={currentGlobalDefaultsForEmbedded}
                    onOverrideChange={(idx, data) =>
                      setLocalBuildingOverrides((prev) => ({
                        ...prev,
                        [idx]: data,
                      }))
                    }
                    onResetToGlobal={(idx) =>
                      setLocalBuildingOverrides((prev) => ({
                        ...prev,
                        [idx]: null,
                      }))
                    }
                  />
                );
              }
            )}
          </div>
        )}

        {/* Apply button */}
        <div className={styles.actions}>
          <button type="submit" className={styles.submit}>
            Apply All Settings & Start Simulation
          </button>
          {Object.keys(formErrors).length > 0 && (
            <div style={{ color: "red", marginTop: "10px", textAlign: "left" }}>
              Please correct the errors before submitting. (See console for
              details)
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default GlobalConfigPage;
