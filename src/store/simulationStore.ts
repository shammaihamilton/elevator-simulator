

import { create, StateCreator } from "zustand";
import { ElevatorManagerFactory } from "@/services/ElevatorManagerFactory";
import { ElevatorRequestFactory } from "@/services/PassengerRequestFactory";
import {
  IElevatorFSM,
  SimulationState,
  EffectiveBuildingSettings,
  IElevatorManager,
} from "../interfaces";
import {
  RequestStatus,
  ElevatorDoorState,
  DispatchStrategy,
} from "../types/enums";
import { SettingsSchema, AppSettings } from "@/config/settingsSchema";
import { EffectiveBuildingSettings as BuildingSpecificSettings } from "@/interfaces/settings.interface";
import loadSettingsFromLocalStorage from "@/utils/loadSettingsFromLocalStorage";
import { FloorStatus } from "@/interfaces/floorStatus.interface";


export interface SimulationStore extends SimulationState {
  resetCounter: number;
  floorStatuses: Record<string, FloorStatus>;
  getFloorStatus: (buildingIndex: number, floorNumber: number) => FloorStatus;
  updateFloorStatuses: () => void;
  getEffectiveSettingsForBuilding: (
    buildingIndex: number
  ) => EffectiveBuildingSettings;
  requestElevator: (
    buildingIndex: number,
    sourceFloor: number,
    destinationFloor: number
  ) => void;
  tick: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  setDispatchStrategy: (dispatchStrategy: DispatchStrategy) => void;
  reset: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateBuildingSettings: (
    buildingIndex: number,
    settings: BuildingSpecificSettings | null
  ) => void;
}

const simulationCreator: StateCreator<SimulationStore> = (set, get) => {
  const _getEffectiveSettingsForBuilding = (
    buildingIndex: number,
    globalSettings: AppSettings,
    specificSettings: Record<number, BuildingSpecificSettings | null>
  ): EffectiveBuildingSettings => {
    const buildingOverrides = specificSettings[buildingIndex];

    if (!buildingOverrides) {
      return {
        dispatchStrategy: globalSettings.buildings.dispatchStrategy,
        floorsPerBuilding: globalSettings.buildings.floorsPerBuilding,
        elevatorsPerBuilding: globalSettings.buildings.elevatorsPerBuilding,
        initialElevatorFloor: globalSettings.buildings.initialElevatorFloor,
        doorOpenTimeMs: globalSettings.timing.doorOpenTimeMs,
        doorTransitionTimeMs: globalSettings.timing.doorTransitionTimeMs,
        floorTravelTimeMs: globalSettings.timing.floorTravelTimeMs,
        delayPerFloorMs: globalSettings.timing.delayPerFloorMs,
      };
    }

    return {
      floorsPerBuilding:
        buildingOverrides.floorsPerBuilding ??
        globalSettings.buildings.floorsPerBuilding,
      elevatorsPerBuilding:
        buildingOverrides.elevatorsPerBuilding ??
        globalSettings.buildings.elevatorsPerBuilding,
      dispatchStrategy:
        buildingOverrides.dispatchStrategy ??
        globalSettings.buildings.dispatchStrategy,
      initialElevatorFloor:
        buildingOverrides.initialElevatorFloor ??
        globalSettings.buildings.initialElevatorFloor,
      doorOpenTimeMs:
        buildingOverrides.doorOpenTimeMs ??
        globalSettings.timing.doorOpenTimeMs,
      doorTransitionTimeMs:
        buildingOverrides.doorTransitionTimeMs ??
        globalSettings.timing.doorTransitionTimeMs,
      floorTravelTimeMs:
        buildingOverrides.floorTravelTimeMs ??
        globalSettings.timing.floorTravelTimeMs,
      delayPerFloorMs:
        buildingOverrides.delayPerFloorMs ??
        globalSettings.timing.delayPerFloorMs,
    };
  };

  const _initManagers = (
    currentGlobalSettings: AppSettings,
    currentBuildingSpecificSettings: Record<
      number,
      BuildingSpecificSettings | null
    >
  ): IElevatorManager[] => {
    const numBuildings = currentGlobalSettings.buildings.numberOfBuildings;

    return Array.from({ length: numBuildings }).map((_, bIdx) => {
      const effectiveSettings = _getEffectiveSettingsForBuilding(
        bIdx,
        currentGlobalSettings,
        currentBuildingSpecificSettings
      );

      const elevatorConfigs = Array.from({
        length: effectiveSettings.elevatorsPerBuilding,
      }).map(() => ({
        initialFloor: effectiveSettings.initialElevatorFloor,
        timing: {
          doorOpenTimeMs: effectiveSettings.doorOpenTimeMs,
          delayPerFloorMs: effectiveSettings.delayPerFloorMs,
          doorTransitionTimeMs: effectiveSettings.doorTransitionTimeMs,
          floorTravelTimeMs: effectiveSettings.floorTravelTimeMs,
        },
      }));
      return ElevatorManagerFactory.create(`B${bIdx + 1}`, elevatorConfigs);
    });
  };

  const _generateInitialFloorStatuses = (
    currentGlobalSettings: AppSettings,
    currentBuildingSpecificSettings: Record<
      number,
      BuildingSpecificSettings | null
    >
  ): Record<string, FloorStatus> => {
    const statuses: Record<string, FloorStatus> = {};
    const defaultStatus = {
      requestStatus: RequestStatus.PENDING_ASSIGNMENT,
      etaSeconds: null,
      isElevatorServicing: false,
    };

    const numBuildings = currentGlobalSettings.buildings.numberOfBuildings;

    for (let building = 0; building < numBuildings; building++) {
      const { floorsPerBuilding } = _getEffectiveSettingsForBuilding(
        building,
        currentGlobalSettings,
        currentBuildingSpecificSettings
      );

      for (let floor = 1; floor <= floorsPerBuilding; floor++) {
        statuses[`${building}-${floor}`] = { ...defaultStatus };
      }
    }
    return statuses;
  };

  const _updateFloorStatusesWithData = (
    managers: IElevatorManager[],
    currentTime: number,
    numBuildings: number,
    getEffectiveSettingsForBuilding: (
      buildingIndex: number
    ) => EffectiveBuildingSettings
  ): Record<string, FloorStatus> => {
    const updatedStatuses: Record<string, FloorStatus> = {};
    const defaultStatus = {
      requestStatus: RequestStatus.PENDING_ASSIGNMENT,
      etaSeconds: null,
      isElevatorServicing: false,
    };

    for (let b = 0; b < numBuildings; b++) {
      const manager = managers[b];
      if (!manager?.elevators?.length) continue;

      const { floorsPerBuilding } = getEffectiveSettingsForBuilding(b);

      for (let f = 0; f <= floorsPerBuilding; f++) {
        const key = `${b}-${f}`;

        // Check if elevator is servicing this floor
        const isElevatorServicing = manager.elevators.some(
          (elevator) =>
            elevator.currentFloor === f &&
            (elevator.doorState === ElevatorDoorState.OPEN ||
              elevator.doorState === ElevatorDoorState.OPENING)
        );

        if (isElevatorServicing) {
          updatedStatuses[key] = {
            requestStatus: RequestStatus.IN_TRANSIT,
            etaSeconds: null,
            isElevatorServicing: true,
          };
          continue;
        }

        // Find minimum ETA among elevators for this floor
        let minEtaMs: number | null = null;
        let floorHasActiveRequest = false;

        for (const elevator of manager.elevators) {
          if (elevator.queueContainsFloor?.(f)) {
            floorHasActiveRequest = true;
            const elevatorEtaMs = elevator.calculateETA(f, currentTime);
            if (minEtaMs === null || elevatorEtaMs < minEtaMs) {
              minEtaMs = elevatorEtaMs;
            }
          }
        }
        updatedStatuses[key] =
          floorHasActiveRequest && minEtaMs !== null
            ? {
                requestStatus: RequestStatus.WAITING_FOR_PICKUP,
                etaSeconds: minEtaMs,
                isElevatorServicing: false,
              }
            : { ...defaultStatus };
      }
    }
    return updatedStatuses;
  };

  const initialGlobalSettings = loadSettingsFromLocalStorage();
  const initialBuildingSpecificSettings: Record<
    number,
    BuildingSpecificSettings | null
  > = {};
  const initialManagers = _initManagers(
    initialGlobalSettings,
    initialBuildingSpecificSettings
  );
  const initialFloorStatuses = _generateInitialFloorStatuses(
    initialGlobalSettings,
    initialBuildingSpecificSettings
  );

  return {
    managers: initialManagers,
    settings: initialGlobalSettings,
    currentTime: initialGlobalSettings.simulation.currentTime,
    isPaused: false,
    floorStatuses: initialFloorStatuses,
    buildingSpecificSettings: initialBuildingSpecificSettings,
    resetCounter: 0,
    // Removed redundant dispatchStrategy property

    // Actions
    reset: () => {
      const defaultGlobalSettings = SettingsSchema.parse({});
      const defaultBuildingSpecificSettings = {};
      const newManagers = _initManagers(
        defaultGlobalSettings,
        defaultBuildingSpecificSettings
      );
      const newFloorStatuses = _generateInitialFloorStatuses(
        defaultGlobalSettings,
        defaultBuildingSpecificSettings
      );

      try {
        set({
          managers: newManagers,
          currentTime: defaultGlobalSettings.simulation.currentTime,
          isPaused: false,
          settings: defaultGlobalSettings,
          buildingSpecificSettings: defaultBuildingSpecificSettings,
          floorStatuses: newFloorStatuses,
          resetCounter: get().resetCounter + 1,
        });

        try {
          localStorage.setItem(
            "appSettings",
            JSON.stringify(defaultGlobalSettings)
          );
        } catch (e) {
          console.error("Failed to save settings to localStorage:", e);
        }
      } catch (error) {
        console.error("Error resetting simulation with Zod defaults:", error);
      }
    },

    setDispatchStrategy: (dispatchStrategy: DispatchStrategy) => {
      try {
        const { settings, managers } = get();

        // Update the settings
        const updatedSettings = {
          ...settings,
          buildings: {
            ...settings.buildings,
            dispatchStrategy: dispatchStrategy,
          },
        };

        // Update existing managers' dispatch strategy
        managers.forEach((manager) => {
          if (
            manager.setDispatchStrategy &&
            typeof manager.setDispatchStrategy === "function"
          ) {
            console.log(
              `Setting dispatch strategy for manager ${manager.id} to ${dispatchStrategy}`
            );

            manager.setDispatchStrategy(dispatchStrategy);
          }
        });

        // Update the store with new settings
        set({
          settings: updatedSettings,
          managers: [...managers], // Trigger reactivity
        });

        // Persist to localStorage
        try {
          localStorage.setItem("appSettings", JSON.stringify(updatedSettings));
        } catch (e) {
          console.error("Failed to save settings to localStorage:", e);
        }
      } catch (error) {
        console.error("Error updating dispatch strategy:", error);
      }
    },

    getEffectiveSettingsForBuilding: (
      buildingIndex: number
    ): EffectiveBuildingSettings => {
      const { settings, buildingSpecificSettings } = get();
      return _getEffectiveSettingsForBuilding(
        buildingIndex,
        settings,
        buildingSpecificSettings
      );
    },

    updateFloorStatuses: () => {
      const { managers, currentTime, settings } = get();
      const floorStatuses = _updateFloorStatusesWithData(
        managers,
        currentTime,
        settings.buildings.numberOfBuildings,
        get().getEffectiveSettingsForBuilding
      );
      set({ floorStatuses });
    },

    getFloorStatus: (buildingIndex: number, floorNumber: number) => {
      const key = `${buildingIndex}-${floorNumber}`;
      return (
        get().floorStatuses[key] || {
          requestStatus: RequestStatus.PENDING_ASSIGNMENT,
          etaSeconds: null,
          isElevatorServicing: false,
        }
      );
    },

    requestElevator: (buildingIndex, sourceFloor, destinationFloor) => {
      const { managers, currentTime } = get();
      const manager = managers[buildingIndex];

      if (manager) {
        const request = ElevatorRequestFactory.create(
          sourceFloor,
          destinationFloor,
          currentTime
        );
        manager.handleRequest(request, currentTime);
        set({ managers: [...managers] });
        get().updateFloorStatuses();
      } else {
        console.error(
          `Elevator manager for building index ${buildingIndex} not found.`
        );
      }
    },

    tick: () => {
      const { managers, settings, currentTime, isPaused } = get();
      if (isPaused) return;

      // Update elevators
      managers.forEach((manager) => {
        manager.elevators.forEach((elevator: IElevatorFSM) => {
          if (
            !elevator.isFSMPaused?.() ||
            typeof elevator.isFSMPaused !== "function"
          ) {
            elevator.update(currentTime);
          }
        });
      });

      // Calculate new time
      const newSimTime = currentTime + settings.simulation.simulationTickMs;

      // Update floor statuses
      const floorStatuses = _updateFloorStatusesWithData(
        managers,
        newSimTime,
        settings.buildings.numberOfBuildings,
        get().getEffectiveSettingsForBuilding
      );

      set({ currentTime: newSimTime, floorStatuses });
    },

    pauseSimulation: () => {
      const { isPaused, managers, currentTime } = get();
      if (!isPaused) {
        managers.forEach((manager) => {
          manager.elevators.forEach((elevator) => {
            elevator.pauseFSM?.(currentTime);
          });
        });
        set({ isPaused: true });
      }
    },

    resumeSimulation: () => {
      const { isPaused, managers, currentTime } = get();
      if (isPaused) {
        managers.forEach((manager) => {
          manager.elevators.forEach((elevator) => {
            elevator.resumeFSM?.(currentTime);
          });
        });
        set({ isPaused: false });
      }
    },

    updateSettings: (newGlobalSettingsPartial: Partial<AppSettings>) => {
      const { settings, buildingSpecificSettings } = get();

      // Deep merge settings
      const potentialNewSettings = {
        ...settings,
        ...newGlobalSettingsPartial,
        buildings: {
          ...settings.buildings,
          ...(newGlobalSettingsPartial.buildings || {}),
        },
        timing: {
          ...settings.timing,
          ...(newGlobalSettingsPartial.timing || {}),
        },
        simulation: {
          ...settings.simulation,
          ...(newGlobalSettingsPartial.simulation || {}),
        },
      };

      try {
        const validatedSettings = SettingsSchema.parse(potentialNewSettings);
        const newManagers = _initManagers(
          validatedSettings,
          buildingSpecificSettings
        );
        const newFloorStatuses = _generateInitialFloorStatuses(
          validatedSettings,
          buildingSpecificSettings
        );

        set({
          settings: validatedSettings,
          managers: newManagers,
          floorStatuses: newFloorStatuses,
          currentTime: validatedSettings.simulation.currentTime,
          isPaused: false,
          resetCounter: get().resetCounter + 1,
        });

        // Add localStorage persistence
        try {
          localStorage.setItem(
            "appSettings",
            JSON.stringify(validatedSettings)
          );
        } catch (e) {
          console.error("Failed to save settings to localStorage:", e);
        }
      } catch (error) {
        console.error("Error updating global settings:", error);
      }
    },

    updateBuildingSettings: (buildingIndex, newSpecificSettings) => {
      const { settings, buildingSpecificSettings } = get();
      const updatedBuildingSpecificSettings = { ...buildingSpecificSettings };
      updatedBuildingSpecificSettings[buildingIndex] = newSpecificSettings;

      const newManagers = _initManagers(
        settings,
        updatedBuildingSpecificSettings
      );
      const newFloorStatuses = _generateInitialFloorStatuses(
        settings,
        updatedBuildingSpecificSettings
      );

      set({
        buildingSpecificSettings: updatedBuildingSpecificSettings,
        managers: newManagers,
        floorStatuses: newFloorStatuses,
        currentTime: settings.simulation.currentTime,
        isPaused: false,
        resetCounter: get().resetCounter + 1,
      });
    },
  };
};

export const useSimulationStore = create<SimulationStore>(simulationCreator);
