import { create, StateCreator } from 'zustand';
import { buildingsSettings } from '@/config/buildingSettings';
import { ElevatorManagerFactory } from '@/services/ElevatorManagerFactory';
import type { SimulationState } from '@/types/interfaces';
import { ElevatorRequestFactory } from '@/services/PassengerRequestFactory';

const simulationCreator: StateCreator<SimulationState> = (set, get, _store) => {
  const initManagers = () => {
    const numBuildings = buildingsSettings.building.buildings;
    const elevatorsPerBuilding = buildingsSettings.building.elevatorsPerBuilding;
    const initialFloor = buildingsSettings.building.initialElevatorFloor;
    const timing = buildingsSettings.timing;


    return Array.from({ length: numBuildings }).map((_, bIdx) => {
      const elevatorConfigs = Array.from({ length: elevatorsPerBuilding }).map(() => ({
        initialFloor,
        timing,
      }));

      return ElevatorManagerFactory.create(`B${bIdx + 1}`, elevatorConfigs);
    });
  };

  const managers = initManagers();

  return {
    managers,
    settings: buildingsSettings,
    currentTime: buildingsSettings.simulation.currentTime as number,

    requestElevator: (buildingIndex, sourceFloor, destinationFloor) => {
      const { managers: currentManagers } = get();
      const request = ElevatorRequestFactory.create(sourceFloor, destinationFloor);
      
      currentManagers[buildingIndex].handleRequest(request);
      set({ managers: [...currentManagers] });
    },

     tick: () => {
      const { managers: currentManagers, settings, currentTime } = get();
      const newCurrentTime = currentTime + settings.simulation.simulationTickMs;

      // 1. Let all elevators process their current state and tasks for the current time
      currentManagers.forEach((manager) => manager.tick(currentTime));
      set({
        managers: [...currentManagers], 
        currentTime: newCurrentTime
      });
    },
    reset: () => {
      const newManagers = initManagers(); 
      set({ managers: newManagers, currentTime: buildingsSettings.simulation.currentTime });
    },
    stop: () => {
      const { managers } = get();
      managers.forEach((manager) => manager.stopAll());
      set({ managers: [...managers] });
    }
  };
};

export const useSimulationStore = create<SimulationState>(simulationCreator);
