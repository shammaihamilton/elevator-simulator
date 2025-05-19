
import { create, StateCreator } from "zustand";
import { appSettings } from "@/config/appSettings";
import { ElevatorManagerFactory } from "@/services/ElevatorManagerFactory";
import {
  AppSettings,
  IElevatorFSM,
  SimulationState,
} from "../interfaces";
import { ElevatorRequestFactory } from "@/services/PassengerRequestFactory";
import { ElevatorManager } from "@/core/ElevatorManager";
import { ElevatorDoorState, RequestStatus } from "@/types/enums";

interface FloorStatus {
  requestStatus: RequestStatus;
  etaSeconds: number | null;
  isElevatorServicing: boolean;
}

export interface SimulationStore extends SimulationState {
  floorStatuses: Record<string, FloorStatus>;
  getFloorStatus: (buildingIndex: number, floorNumber: number) => FloorStatus;
  updateFloorStatuses: () => void;
}

const simulationCreator: StateCreator<SimulationStore> = (set, get) => {
  const initManagers = (): ElevatorManager[] => {
    const settings = appSettings; 
    const numBuildings = appSettings.buildings.buildings;
    const elevatorsPerBuilding = appSettings.buildings.elevatorsPerBuilding;
    const initialFloor = appSettings.buildings.initialElevatorFloor;
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
  
  // Generate initial floor statuses
  const generateInitialFloorStatuses = () => {
    const statuses: Record<string, FloorStatus> = {};
    const settings = appSettings;
    const numBuildings = settings.buildings.buildings;
    const floorsPerBuilding = settings.buildings.floorsPerBuilding;
    
    for (let b = 0; b < numBuildings; b++) {
      for (let f = 1; f <= floorsPerBuilding; f++) {
        const key = `${b}-${f}`;
        statuses[key] = {
          requestStatus: RequestStatus.PENDING_ASSIGNMENT,
          etaSeconds: null,
          isElevatorServicing: false
        };
      }
    }
    
    return statuses;
  };
  
  return {
    managers: initManagers(), 
    settings: { ...appSettings }, 
    currentTime: appSettings.simulation.currentTime ?? 0,
    isPaused: false,
    floorStatuses: generateInitialFloorStatuses(),

    // Update all floor statuses based on current simulation state
    updateFloorStatuses: () => {
      const { managers, currentTime, settings } = get();
      const numBuildings = settings.buildings.buildings;
      const floorsPerBuilding = settings.buildings.floorsPerBuilding;
      const updatedStatuses: Record<string, FloorStatus> = {};
      
      for (let b = 0; b < numBuildings; b++) {
        const manager = managers[b];
        if (!manager || !manager.elevators || manager.elevators.length === 0) continue;
        
        for (let f = 1; f <= floorsPerBuilding; f++) {
          const key = `${b}-${f}`;
          
          // Check if any elevator is servicing this floor
          const isElevatorServicing = manager.elevators.some(elevator => 
            elevator.currentFloor === f && 
            (elevator.doorState === ElevatorDoorState.OPEN || elevator.doorState === ElevatorDoorState.OPENING)
          );
          
          if (isElevatorServicing) {
            updatedStatuses[key] = {
              requestStatus: RequestStatus.IN_TRANSIT,
              etaSeconds: null,
              isElevatorServicing: true
            };
            continue;
          }
          
          // Find active requests for this floor
          let minEtaMs = null;
          let floorHasActiveRequest = false;
          
          for (const elevator of manager.elevators) {
            if (typeof elevator.queueContainsFloor === 'function' && elevator.queueContainsFloor(f)) {
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
              isElevatorServicing: false
            };
          } else {
            updatedStatuses[key] = {
              requestStatus: RequestStatus.PENDING_ASSIGNMENT,
              etaSeconds: null,
              isElevatorServicing: false
            };
          }
        }
      }
      
      set({ floorStatuses: updatedStatuses });
    },
    
    // Get floor status from the cached statuses
    getFloorStatus: (buildingIndex: number, floorNumber: number) => {
      const { floorStatuses } = get();
      const key = `${buildingIndex}-${floorNumber}`;
      return floorStatuses[key] || {
        requestStatus: RequestStatus.PENDING_ASSIGNMENT,
        etaSeconds: null,
        isElevatorServicing: false
      };
    },

    requestElevator: (buildingIndex, sourceFloor, destinationFloor) => {
      const { managers: currentManagers, currentTime: currentTime } = get(); // Get current simulation time
      const updatedManagers = [...currentManagers];
      const request = ElevatorRequestFactory.create(
        sourceFloor,
        destinationFloor,
        currentTime // Pass current simulation time for request creation (sets 'requestedAt')
      );

      // Pass currentSimTime to handleRequest for accurate ETA calculations
      updatedManagers[buildingIndex].handleRequest(request, currentTime);
      set({ managers: updatedManagers });
      
      // Update floor statuses after requesting an elevator
      get().updateFloorStatuses();
    },

    tick: () => {
      const {
        managers: currentManagers,
        settings,
        currentTime: currentSimTime,
        isPaused,
      } = get();
      if (isPaused) return; 
      
      // Update elevator states
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
      
      // First update the time, then update floor statuses in a single state update
      // to avoid multiple rerenders
      set({
        currentTime: currentSimTime + settings.simulation.simulationTickMs,
        floorStatuses: (() => {
          // Calculate updated floor statuses inline
          const numBuildings = settings.buildings.buildings;
          const floorsPerBuilding = settings.buildings.floorsPerBuilding;
          const updatedStatuses: Record<string, FloorStatus> = {};
          
          // Use the latest time for calculations
          const updatedTime = currentSimTime + settings.simulation.simulationTickMs;
          
          for (let b = 0; b < numBuildings; b++) {
            const manager = currentManagers[b];
            if (!manager || !manager.elevators || manager.elevators.length === 0) continue;
            
            for (let f = 1; f <= floorsPerBuilding; f++) {
              const key = `${b}-${f}`;
              
              // Check if any elevator is servicing this floor
              const isElevatorServicing = manager.elevators.some(elevator => 
                elevator.currentFloor === f && 
                (elevator.doorState === ElevatorDoorState.OPEN || elevator.doorState === ElevatorDoorState.OPENING)
              );
              
              if (isElevatorServicing) {
                updatedStatuses[key] = {
                  requestStatus: RequestStatus.IN_TRANSIT,
                  etaSeconds: null,
                  isElevatorServicing: true
                };
                continue;
              }
              
              // Find active requests for this floor
              let minEtaMs = null;
              let floorHasActiveRequest = false;
              
              for (const elevator of manager.elevators) {
                if (typeof elevator.queueContainsFloor === 'function' && elevator.queueContainsFloor(f)) {
                  floorHasActiveRequest = true;
                  const elevatorEtaMs = elevator.calculateETA(f, updatedTime);
                  if (minEtaMs === null || elevatorEtaMs < minEtaMs) {
                    minEtaMs = elevatorEtaMs;
                  }
                }
              }
              
              if (floorHasActiveRequest && minEtaMs !== null) {
                updatedStatuses[key] = {
                  requestStatus: RequestStatus.WAITING_FOR_PICKUP,
                  etaSeconds: Math.max(0, Math.ceil(minEtaMs / 1000)),
                  isElevatorServicing: false
                };
              } else {
                updatedStatuses[key] = {
                  requestStatus: RequestStatus.PENDING_ASSIGNMENT,
                  etaSeconds: null,
                  isElevatorServicing: false
                };
              }
            }
          }
          
          return updatedStatuses;
        })()
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
        currentTime: appSettings.simulation.currentTime ?? 0,
        isPaused: false,
        settings: { ...appSettings }, 
        floorStatuses: generateInitialFloorStatuses()
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
          building: { ...state.settings.buildings, ...newSettings.buildings },
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