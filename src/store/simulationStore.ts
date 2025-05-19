
import { create, StateCreator } from "zustand";
import { appSettings } from "@/config/appSettings"; // Your default settings
import { ElevatorManagerFactory } from "@/services/ElevatorManagerFactory"; // Your factory
import { ElevatorRequestFactory } from "@/services/PassengerRequestFactory"; // Your factory
import {
  AppSettings,
  IElevatorFSM,
  SimulationState,
  BuildingSpecificSettings,
  EffectiveBuildingSettings,
  IElevatorManager, // Assuming IElevatorManager is the type for manager instances
} from "../interfaces"; // Adjust path as needed
import { RequestStatus, ElevatorDoorState } from "../types/enums";

interface FloorStatus {
  requestStatus: RequestStatus;
  etaSeconds: number | null;
  isElevatorServicing: boolean;
}

export interface SimulationStore extends SimulationState {
  resetCounter: number;
  floorStatuses: Record<string, FloorStatus>;
  getFloorStatus: (buildingIndex: number, floorNumber: number) => FloorStatus;
  updateFloorStatuses: () => void;
  getEffectiveSettingsForBuilding: (buildingIndex: number) => EffectiveBuildingSettings;
  requestElevator: (buildingIndex: number, sourceFloor: number, destinationFloor: number) => void;
  tick: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  reset: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateBuildingSettings: (buildingIndex: number, settings: BuildingSpecificSettings | null) => void;
}

const simulationCreator: StateCreator<SimulationStore> = (
  set: (partial: Partial<SimulationStore> | ((state: SimulationStore) => Partial<SimulationStore>), replace?: false | undefined) => void,
  get: () => SimulationStore,
) => {
  const _getEffectiveSettingsForBuilding = (
    buildingIndex: number,
    globalSettings: AppSettings,
    specificSettings: Record<number, BuildingSpecificSettings | null>
  ): EffectiveBuildingSettings => {
    const buildingOverrides = specificSettings[buildingIndex];

    if (!buildingOverrides) {
      return {
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
    currentBuildingSpecificSettings: Record<number, BuildingSpecificSettings | null>
  ): IElevatorManager[] => {
    const numBuildings = currentGlobalSettings.buildings.buildings;

    return Array.from({ length: numBuildings }).map((_, bIdx) => {
      const effectiveSettings = _getEffectiveSettingsForBuilding(
        bIdx,
        currentGlobalSettings,
        currentBuildingSpecificSettings
      );

      const elevatorConfigs = Array.from({ length: effectiveSettings.elevatorsPerBuilding }).map(
        () => ({
          initialFloor: effectiveSettings.initialElevatorFloor,
          timing: {
            doorOpenTimeMs: effectiveSettings.doorOpenTimeMs,
            delayPerFloorMs: effectiveSettings.delayPerFloorMs,
            doorTransitionTimeMs: effectiveSettings.doorTransitionTimeMs,
            floorTravelTimeMs: effectiveSettings.floorTravelTimeMs,
          },
        })
      );
      return ElevatorManagerFactory.create(`B${bIdx + 1}`, elevatorConfigs);
    });
  };

  const _generateInitialFloorStatuses = (
    currentGlobalSettings: AppSettings,
    currentBuildingSpecificSettings: Record<number, BuildingSpecificSettings | null>
  ): Record<string, FloorStatus> => {
    const statuses: Record<string, FloorStatus> = {};
    const numBuildings = currentGlobalSettings.buildings.buildings;

    for (let b = 0; b < numBuildings; b++) {
      const effectiveSettings = _getEffectiveSettingsForBuilding(
        b,
        currentGlobalSettings,
        currentBuildingSpecificSettings
      );
      for (let f = 1; f <= effectiveSettings.floorsPerBuilding; f++) {
        const key = `${b}-${f}`;
        statuses[key] = {
          requestStatus: RequestStatus.PENDING_ASSIGNMENT,
          etaSeconds: null,
          isElevatorServicing: false,
        };
      }
    }
    return statuses;
  };

  const initialGlobalSettings = { ...appSettings };
  const initialBuildingSpecificSettings: Record<number, BuildingSpecificSettings | null> = {};
  const initialManagers = _initManagers(initialGlobalSettings, initialBuildingSpecificSettings);
  const initialFloorStatuses = _generateInitialFloorStatuses(initialGlobalSettings, initialBuildingSpecificSettings);

  return {
    managers: initialManagers,
    settings: initialGlobalSettings,
    currentTime: initialGlobalSettings.simulation.currentTime ?? 0,
    isPaused: false,
    floorStatuses: initialFloorStatuses,
    buildingSpecificSettings: initialBuildingSpecificSettings,
    resetCounter: 0,

    reset: () => {
      console.log("Resetting simulation with default appSettings.");
      const defaultGlobalSettings = { ...appSettings };
      const defaultBuildingSpecificSettings: Record<number, BuildingSpecificSettings | null> = {};
      const newManagers = _initManagers(defaultGlobalSettings, defaultBuildingSpecificSettings);
      const newFloorStatuses = _generateInitialFloorStatuses(defaultGlobalSettings, defaultBuildingSpecificSettings);

      set({
        managers: newManagers,
        currentTime: defaultGlobalSettings.simulation.currentTime ?? 0,
        isPaused: false,
        settings: defaultGlobalSettings,
        buildingSpecificSettings: defaultBuildingSpecificSettings,
        floorStatuses: newFloorStatuses,
        resetCounter: get().resetCounter + 1, // <<< INCREMENT ON RESET
      });
    },

    getEffectiveSettingsForBuilding: (buildingIndex: number): EffectiveBuildingSettings => {
      const state = get();
      return _getEffectiveSettingsForBuilding(
        buildingIndex,
        state.settings,
        state.buildingSpecificSettings
      );
    },

    updateFloorStatuses: () => {
      const { managers, currentTime } = get();
      const updatedStatuses: Record<string, FloorStatus> = {};
      const numGlobalBuildings = get().settings.buildings.buildings;

      for (let b = 0; b < numGlobalBuildings; b++) {
        const manager = managers[b];
        if (!manager || !manager.elevators || manager.elevators.length === 0) continue;

        const effectiveBuildingLayout = get().getEffectiveSettingsForBuilding(b);

        for (let f = 1; f <= effectiveBuildingLayout.floorsPerBuilding; f++) {
          const key = `${b}-${f}`;
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

          let minEtaMs: number | null = null;
          let floorHasActiveRequest = false;

          for (const elevator of manager.elevators) {
            if (
              typeof elevator.queueContainsFloor === "function" &&
              elevator.queueContainsFloor(f)
            ) {
              floorHasActiveRequest = true;
              const elevatorEtaMs = elevator.calculateETA(f, currentTime);
              if (minEtaMs === null || elevatorEtaMs < minEtaMs) {
                minEtaMs = elevatorEtaMs;
              }
            }
          }

          if (floorHasActiveRequest && minEtaMs !== null) {
            updatedStatuses[key] = {
              requestStatus: RequestStatus.WAITING_FOR_PICKUP,
              etaSeconds: Math.max(0, Math.ceil(minEtaMs / 1000)),
              isElevatorServicing: false,
            };
          } else {
            updatedStatuses[key] = {
              requestStatus: RequestStatus.PENDING_ASSIGNMENT,
              etaSeconds: null,
              isElevatorServicing: false,
            };
          }
        }
      }
      set({ floorStatuses: updatedStatuses });
    },

    getFloorStatus: (buildingIndex: number, floorNumber: number) => {
      const { floorStatuses } = get();
      const key = `${buildingIndex}-${floorNumber}`;
      return (
        floorStatuses[key] || {
          requestStatus: RequestStatus.PENDING_ASSIGNMENT,
          etaSeconds: null,
          isElevatorServicing: false,
        }
      );
    },

    requestElevator: (buildingIndex, sourceFloor, destinationFloor) => {
      const { managers: currentManagers, currentTime: currentSimTime } = get();
      const managerForBuilding = currentManagers[buildingIndex];

      if (managerForBuilding) {
        const request = ElevatorRequestFactory.create(
          sourceFloor,
          destinationFloor,
          currentSimTime
        );
        managerForBuilding.handleRequest(request, currentSimTime);
        set({ managers: [...currentManagers] });
        get().updateFloorStatuses();
      } else {
        console.error(`Elevator manager for building index ${buildingIndex} not found.`);
      }
    },

    tick: () => {
      const {
        managers: currentManagers,
        settings: currentGlobalSettings,
        currentTime: currentSimTime,
        isPaused,
      } = get();

      if (isPaused) return;

      currentManagers.forEach((manager) => {
        manager.elevators.forEach((elevator: IElevatorFSM) => {
          if (
            typeof elevator.isFSMPaused === "function" &&
            !elevator.isFSMPaused()
          ) {
            elevator.update(currentSimTime);
          } else if (typeof elevator.isFSMPaused !== "function") {
            elevator.update(currentSimTime);
          }
        });
      });

      const newSimTime = currentSimTime + currentGlobalSettings.simulation.simulationTickMs;
      const updatedStatuses: Record<string, FloorStatus> = {};
      const numGlobalBuildings = currentGlobalSettings.buildings.buildings;

      for (let b = 0; b < numGlobalBuildings; b++) {
        const manager = currentManagers[b];
        if (!manager || !manager.elevators || manager.elevators.length === 0) continue;
        
        const effectiveBuildingLayout = get().getEffectiveSettingsForBuilding(b);

        for (let f = 0; f <= effectiveBuildingLayout.floorsPerBuilding; f++) {
          const key = `${b}-${f}`;
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

          let minEtaMs: number | null = null;
          let floorHasActiveRequest = false;
          for (const elevator of manager.elevators) {
            if (typeof elevator.queueContainsFloor === "function" && elevator.queueContainsFloor(f)) {
              floorHasActiveRequest = true;
              const elevatorEtaMs = elevator.calculateETA(f, newSimTime);
              if (minEtaMs === null || elevatorEtaMs < minEtaMs) {
                minEtaMs = elevatorEtaMs;
              }
            }
          }

          if (floorHasActiveRequest && minEtaMs !== null) {
            updatedStatuses[key] = {
              requestStatus: RequestStatus.WAITING_FOR_PICKUP,
              etaSeconds: Math.max(0, Math.ceil(minEtaMs / 1000)),
              isElevatorServicing: false,
            };
          } else {
            updatedStatuses[key] = {
              requestStatus: RequestStatus.PENDING_ASSIGNMENT,
              etaSeconds: null,
              isElevatorServicing: false,
            };
          }
        }
      }
      set({ currentTime: newSimTime, floorStatuses: updatedStatuses });
    },

    pauseSimulation: () => {
      const { isPaused, managers: currentManagers, currentTime } = get();
      if (!isPaused) {
        console.log(`Simulation pausing at: ${currentTime}`);
        currentManagers.forEach((manager) => {
          manager.elevators.forEach((elevator) => {
            if (typeof elevator.pauseFSM === "function") {
              elevator.pauseFSM(currentTime);
            }
          });
        });
        set({ isPaused: true });
      }
    },

    resumeSimulation: () => {
      const { isPaused, managers: currentManagers, currentTime } = get();
      if (isPaused) {
        console.log(`Simulation resuming at: ${currentTime}`);
        currentManagers.forEach((manager) => {
          manager.elevators.forEach((elevator) => {
            if (typeof elevator.resumeFSM === "function") {
              elevator.resumeFSM(currentTime);
            }
          });
        });
        set({ isPaused: false });
      }
    },


    updateSettings: (newGlobalSettingsPartial: Partial<AppSettings>) => {
      const currentState = get();
      const updatedGlobalSettings = {
        ...currentState.settings,
        ...newGlobalSettingsPartial,
        buildings: {
          ...currentState.settings.buildings,
          ...(newGlobalSettingsPartial.buildings || {}),
        },
        timing: { ...currentState.settings.timing, ...(newGlobalSettingsPartial.timing || {}) },
        simulation: {
          ...currentState.settings.simulation,
          ...(newGlobalSettingsPartial.simulation || {}),
        },
      };

      console.log("Global settings updated, re-initializing simulation state:", updatedGlobalSettings);
      
      const newManagers = _initManagers(updatedGlobalSettings, currentState.buildingSpecificSettings);
      const newFloorStatuses = _generateInitialFloorStatuses(updatedGlobalSettings, currentState.buildingSpecificSettings);

      set({
        settings: updatedGlobalSettings,
        managers: newManagers,
        floorStatuses: newFloorStatuses,
        currentTime: updatedGlobalSettings.simulation.currentTime ?? (currentState.settings.simulation.currentTime ?? 0),
        isPaused: false,
        resetCounter: get().resetCounter + 1,
      });
    },

    updateBuildingSettings: (
      buildingIndex: number,
      newSpecificSettings: BuildingSpecificSettings | null
    ) => {
      const currentState = get();
      const updatedBuildingSpecificSettings = { ...currentState.buildingSpecificSettings };

      if (newSpecificSettings === null) {
        updatedBuildingSpecificSettings[buildingIndex] = null;
      } else {
        updatedBuildingSpecificSettings[buildingIndex] = newSpecificSettings;
      }

      console.log(`Building ${buildingIndex} settings updated, re-initializing simulation state:`, newSpecificSettings);
      
      const newManagers = _initManagers(currentState.settings, updatedBuildingSpecificSettings);
      const newFloorStatuses = _generateInitialFloorStatuses(currentState.settings, updatedBuildingSpecificSettings);

      set({
        buildingSpecificSettings: updatedBuildingSpecificSettings,
        managers: newManagers,
        floorStatuses: newFloorStatuses,
        currentTime: currentState.settings.simulation.currentTime ?? 0,
        isPaused: false,
        resetCounter: get().resetCounter + 1
      });
    },
  };
};

export const useSimulationStore = create<SimulationStore>(simulationCreator);