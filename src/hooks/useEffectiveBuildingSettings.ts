import { useSimulationStore } from "@/store/simulationStore";

/**
 * Hook to get the effective settings for a specific building
 *
 * @param buildingIndex Index of the building
 * @returns An object containing all effective settings for the building
 */
export const useEffectiveBuildingSettings = (buildingIndex: number) => {
  const globalSettings = useSimulationStore((state) => state.settings);
  const buildingSettings = useSimulationStore(
    (state) => state.buildingSpecificSettings[buildingIndex] || null
  );

  if (!buildingSettings) {
    return {
      floorsPerBuilding: globalSettings.buildings.floorsPerBuilding,
      elevatorsPerBuilding: globalSettings.buildings.elevatorsPerBuilding,
      initialElevatorFloor: globalSettings.buildings.initialElevatorFloor,
      doorOpenTimeMs: globalSettings.timing.doorOpenTimeMs,
      doorTransitionTimeMs: globalSettings.timing.doorTransitionTimeMs,
      floorTravelTimeMs: globalSettings.timing.floorTravelTimeMs,
      delayPerFloorMs: globalSettings.timing.delayPerFloorMs,
      dispatchStrategy: globalSettings.buildings.dispatchStrategy,
      // Indicates if this building uses custom settings
      hasCustomSettings: false,
    };
  }

  // Merge global settings with building-specific overrides
  return {
    floorsPerBuilding:
      buildingSettings.floorsPerBuilding ??
      globalSettings.buildings.floorsPerBuilding,
    elevatorsPerBuilding:
      buildingSettings.elevatorsPerBuilding ??
      globalSettings.buildings.elevatorsPerBuilding,
    initialElevatorFloor:
      buildingSettings.initialElevatorFloor ??
      globalSettings.buildings.initialElevatorFloor,
    doorOpenTimeMs:
      buildingSettings.doorOpenTimeMs ?? globalSettings.timing.doorOpenTimeMs,
    doorTransitionTimeMs:
      buildingSettings.doorTransitionTimeMs ??
      globalSettings.timing.doorTransitionTimeMs,
    floorTravelTimeMs:
      buildingSettings.floorTravelTimeMs ??
      globalSettings.timing.floorTravelTimeMs,
    delayPerFloorMs:
      buildingSettings.delayPerFloorMs ?? globalSettings.timing.delayPerFloorMs,
    dispatchStrategy:
      buildingSettings.dispatchStrategy ?? globalSettings.buildings.dispatchStrategy, 
    // Indicates if this building uses custom settings
    hasCustomSettings: true,
  };
};