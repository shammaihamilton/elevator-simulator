import { create } from 'zustand';
import type { BuildingConfig } from '../types/interfaces';
import { ElevatorManager } from '../core/ElevatorManager';
import { GlobalSystemState } from '../types/enums';

type BuildingLayout = Array<{
  numSystems: number;
  systemConfig: BuildingConfig;
}>;

export interface BuildingState {
  id: string;
  systems: ElevatorManager[];
}

interface SimulationState {
  globalConfig: BuildingConfig | null;
  buildings: BuildingState[];
  currentTime: number;
  globalSystemState: GlobalSystemState;
  simulationSpeedFactor: number;
  isSimulationRunning: boolean;

  // Actions
  initializeSimulation: (config: BuildingConfig, buildingLayout: BuildingLayout) => void;
  addPassengerRequest: (buildingId: string, systemId: string, sourceFloor: number, destinationFloor: number) => string;
  tick: () => void;
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  globalConfig: null,
  buildings: [],
  currentTime: 0,
  globalSystemState: GlobalSystemState.NORMAL,
  simulationSpeedFactor: 1,
  isSimulationRunning: false,

  initializeSimulation: (config: BuildingConfig, buildingLayout: BuildingLayout) => {
    const newBuildings: BuildingState[] = buildingLayout.map((bLayout, bIndex) => {
      const buildingId = `building-${bIndex}`;
      const systems: ElevatorManager[] = [];

      for (let sIndex = 0; sIndex < bLayout.numSystems; sIndex++) {
        systems.push(new ElevatorManager(bLayout.systemConfig));
      }

      return { id: buildingId, systems };
    });

    set({
      globalConfig: config,
      buildings: newBuildings,
      currentTime: 0,
      globalSystemState: GlobalSystemState.NORMAL,
      isSimulationRunning: false,
    });
  },

  addPassengerRequest: (buildingId: string, systemId: string, sourceFloor: number, destinationFloor: number) => {
    const buildings = get().buildings;
    const building = buildings.find(b => b.id === buildingId);
    const system = building?.systems[parseInt(systemId.split('-').pop() || '0')];
    
    if (system) {
      const direction = destinationFloor > sourceFloor ? "UP" : "DOWN";
      const requestId = system.addPassengerRequestFromFloorCall(sourceFloor, destinationFloor, direction);
      set(state => ({ buildings: [...state.buildings] }));
      return requestId;
    }
    return '';
  },

  tick: () => {
    if (!get().isSimulationRunning) return;
    
    get().buildings.forEach(building => {
      building.systems.forEach(system => {
        system.tick();
      });
    });

    set(state => ({
      currentTime: state.currentTime + 1,
      buildings: [...state.buildings]
    }));
  },

  toggleSimulation: () => set(state => ({ isSimulationRunning: !state.isSimulationRunning })),
  
  setSimulationSpeed: (speed: number) => set({ simulationSpeedFactor: Math.max(0.1, speed) })
}));