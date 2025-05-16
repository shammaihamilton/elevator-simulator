import { AppSettings } from '../types/interfaces';

export const buildingsSettings: AppSettings = {
  building: {
    buildings: 1,
    floorsPerBuilding: 8,
    elevatorsPerBuilding: 3,
    initialElevatorFloor: 0,
  },
  timing: {
    doorOpenTimeMs: 3000,
    delayPerFloorMs: 1000,
    doorTransitionTimeMs: 1500,
    floorTravelTimeMs: 2000,
  },
  simulation: {
    simulationTickMs: 100,
    simulationSpeedFactor: 1,
    currentTime: 0,
  },
};