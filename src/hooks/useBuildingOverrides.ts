// hooks/useBuildingOverrides.ts
import { useState, useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { BuildingFormData } from "../components/buildingConfigDialog/BuildingConfigDialog";
import { AppSettings } from "@/config/settingsSchema";

export const useBuildingOverrides = (globalSettings: AppSettings) => {
  const storeBuildingSpecificSettings = useSimulationStore((s) => s.buildingSpecificSettings);
  const updateBuildingSettings = useSimulationStore((s) => s.updateBuildingSettings);
  
  const [localBuildingOverrides, setLocalBuildingOverrides] = useState<
    Record<number, BuildingFormData | null>
  >({});

  // Initialize building overrides based on global settings
  useEffect(() => {
    const numBuildings = globalSettings.buildings.numberOfBuildings;
    const globalDefaultsForOverrides: BuildingFormData = {
      floorsPerBuilding: globalSettings.buildings.floorsPerBuilding,
      elevatorsPerBuilding: globalSettings.buildings.elevatorsPerBuilding,
      dispatchStrategy: globalSettings.buildings.dispatchStrategy,
      initialElevatorFloor: globalSettings.buildings.initialElevatorFloor,
      doorOpenTimeMs: globalSettings.timing.doorOpenTimeMs,
      doorTransitionTimeMs: globalSettings.timing.doorTransitionTimeMs,
      floorTravelTimeMs: globalSettings.timing.floorTravelTimeMs,
      delayPerFloorMs: globalSettings.timing.delayPerFloorMs,
    };

    const initialOverrides: Record<number, BuildingFormData | null> = {};
    
    for (let i = 0; i < numBuildings; i++) {
      const specific = storeBuildingSpecificSettings[i];
      initialOverrides[i] = specific 
        ? { ...globalDefaultsForOverrides, ...specific }
        : null;
    }
    
    setLocalBuildingOverrides(initialOverrides);
  }, [globalSettings, storeBuildingSpecificSettings]);

  const handleOverrideChange = (index: number, data: BuildingFormData | null) => {
    setLocalBuildingOverrides((prev) => ({
      ...prev,
      [index]: data,
    }));
  };

  const handleResetToGlobal = (index: number) => {
    setLocalBuildingOverrides((prev) => ({
      ...prev,
      [index]: null,
    }));
  };

  const applyBuildingOverrides = (validatedSettings: AppSettings) => {
    const numBuildings = validatedSettings.buildings.numberOfBuildings;
    
    // Apply current overrides
    for (let i = 0; i < numBuildings; i++) {
      const override = localBuildingOverrides[i];
      if (override) {
        const safeOverride = {
          ...override,
          dispatchStrategy: override.dispatchStrategy || validatedSettings.buildings.dispatchStrategy
        };
        updateBuildingSettings(i, safeOverride);
        
        // ADDED: Apply dispatch strategy immediately to the building's manager
        const managers = useSimulationStore.getState().managers;
        const manager = managers[i];
        
        if (manager && manager.setDispatchStrategy && typeof manager.setDispatchStrategy === "function") {
          manager.setDispatchStrategy(safeOverride.dispatchStrategy);
        }
      } else {
        updateBuildingSettings(i, null);
        
        // ADDED: Apply global dispatch strategy to buildings without overrides
        const managers = useSimulationStore.getState().managers;
        const manager = managers[i];
        
        if (manager && manager.setDispatchStrategy && typeof manager.setDispatchStrategy === "function") {
          manager.setDispatchStrategy(validatedSettings.buildings.dispatchStrategy);
        }
      }
    }

    // Clean up old overrides for buildings that no longer exist
    Object.keys(storeBuildingSpecificSettings).forEach((keyStr) => {
      const index = parseInt(keyStr, 10);
      if (index >= numBuildings) {
        updateBuildingSettings(index, null);
      }
    });
  };

  const getCurrentGlobalDefaults = (): BuildingFormData => ({
    floorsPerBuilding: globalSettings.buildings.floorsPerBuilding,
    elevatorsPerBuilding: globalSettings.buildings.elevatorsPerBuilding,
    dispatchStrategy: globalSettings.buildings.dispatchStrategy,
    initialElevatorFloor: globalSettings.buildings.initialElevatorFloor,
    doorOpenTimeMs: globalSettings.timing.doorOpenTimeMs,
    doorTransitionTimeMs: globalSettings.timing.doorTransitionTimeMs,
    delayPerFloorMs: globalSettings.timing.delayPerFloorMs,
    floorTravelTimeMs: globalSettings.timing.floorTravelTimeMs,
  });

  return {
    localBuildingOverrides,
    handleOverrideChange,
    handleResetToGlobal,
    applyBuildingOverrides,
    getCurrentGlobalDefaults,
  };
};