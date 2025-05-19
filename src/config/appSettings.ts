import { AppSettings } from '@/interfaces';

export const appSettings: AppSettings = {
  buildings: {
    buildings: 1,
    floorsPerBuilding: 8,
    elevatorsPerBuilding: 3,
    initialElevatorFloor: 0,
  },
  timing: {
    doorOpenTimeMs: 3000,
    delayPerFloorMs: 2000,
    doorTransitionTimeMs: 1000,
    floorTravelTimeMs: 2000,
  },
  simulation: {
    simulationTickMs: 100,
    simulationSpeedFactor: 1,
    currentTime: 0,
  },
};