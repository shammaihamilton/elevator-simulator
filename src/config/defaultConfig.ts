import { AppSettings } from '@/interfaces';

export const defaultAppSettings: AppSettings = {
  buildings: {
    numberOfBuildings: 1,
    floorsPerBuilding: 7,
    elevatorsPerBuilding: 3,
    initialElevatorFloor: 0,
  },
  timing: {
    doorOpenTimeMs: 1000,
    delayPerFloorMs: 1000,
    doorTransitionTimeMs: 500,
    floorTravelTimeMs: 500,
  },
  simulation: {
    simulationTickMs: 100,
    simulationSpeedFactor: 1,
    currentTime: 0,
  },
};

export default defaultAppSettings;