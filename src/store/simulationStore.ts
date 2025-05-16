import { create, StateCreator } from "zustand";
import { buildingsSettings } from "@/config/buildingSettings";
import { ElevatorManagerFactory } from "@/services/ElevatorManagerFactory";
import type {
  AppSettings,
  SimulationState,
  IElevatorFSM,
} from "@/types/interfaces";
import { ElevatorRequestFactory } from "@/services/PassengerRequestFactory";
import { ElevatorManager } from "@/core/ElevatorManager";
interface SimulationStore extends SimulationState {
}

const simulationCreator: StateCreator<SimulationStore> = (set, get) => {
  const initManagers = (): ElevatorManager[] => {
    const settings = buildingsSettings; 
    const numBuildings = settings.building.buildings;
    const elevatorsPerBuilding = settings.building.elevatorsPerBuilding;
    const initialFloor = settings.building.initialElevatorFloor;
    const timing = settings.timing;

    return Array.from({ length: numBuildings }).map((_, bIdx) => {
      const elevatorConfigs = Array.from({ length: elevatorsPerBuilding }).map(
        () => ({
          initialFloor,
          timing,
        })
      );
      return ElevatorManagerFactory.create(`B${bIdx + 1}`, elevatorConfigs);
    });
  };
  return {
    managers: initManagers(), 
    settings: { ...buildingsSettings }, 
    currentTime: buildingsSettings.simulation.currentTime ?? 0,
    isPaused: false, 

    requestElevator: (buildingIndex, sourceFloor, destinationFloor) => {
      const { managers: currentManagers } = get();
      const updatedManagers = [...currentManagers];
      const request = ElevatorRequestFactory.create(
        sourceFloor,
        destinationFloor
      );

      updatedManagers[buildingIndex].handleRequest(request);
      set({ managers: updatedManagers });
    },

    tick: () => {
      const {
        managers: currentManagers,
        settings,
        currentTime: currentSimTime,
        isPaused,
      } = get();
      if (isPaused) return; 
      currentManagers.forEach((manager) => {
        manager.elevators.forEach((elevator: IElevatorFSM) => {
          if (
            typeof (elevator as any).isFSMPaused === "function" &&
            !(elevator as any).isFSMPaused()
          ) {
            elevator.update(currentSimTime);
          } else if (typeof (elevator as any).isFSMPaused !== "function") {
            elevator.update(currentSimTime);
          }
        });
      });
      set({
        currentTime: currentSimTime + settings.simulation.simulationTickMs,
      });
    },

    pauseSimulation: () => {
      const { isPaused, managers: currentManagers, currentTime } = get();
      if (!isPaused) {
        console.log(`Simulation pausing at: ${currentTime}`);
        currentManagers.forEach((manager) => {
          manager.elevators.forEach((elevator) => {
            if (typeof (elevator as IElevatorFSM).pauseFSM === "function") {
              (elevator as IElevatorFSM).pauseFSM(currentTime);
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
            if (typeof (elevator as IElevatorFSM).resumeFSM === "function") {
              (elevator as IElevatorFSM).resumeFSM(currentTime);
            }
          });
        });
        set({ isPaused: false });
      }
    },

    reset: () => {
      console.log("Resetting simulation.");
      set({
        managers: initManagers(), 
        currentTime: buildingsSettings.simulation.currentTime ?? 0,
        isPaused: false,
        settings: { ...buildingsSettings }, 
      });
    },


    stop: () => {
      console.log("Simulation stop requested.");
      get().pauseSimulation(); 
    },

    updateSettings: (newSettings: Partial<AppSettings>) => {
      set((state) => {
        const updatedSettings = {
          ...state.settings,
          ...newSettings,
          building: { ...state.settings.building, ...newSettings.building },
          timing: { ...state.settings.timing, ...newSettings.timing },
          simulation: {
            ...state.settings.simulation,
            ...newSettings.simulation,
          },
        };

        console.log("Simulation settings updated:", updatedSettings);
        return { settings: updatedSettings };
      });
    },
  };
};

export const useSimulationStore = create<SimulationStore>(simulationCreator);
