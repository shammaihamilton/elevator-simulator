import { AppSettings } from '@/interfaces';
import { DispatchStrategy } from '@/types/enums';

export const defaultAppSettings: AppSettings = {
  buildings: {
    numberOfBuildings: 1,
    floorsPerBuilding: 7,
    elevatorsPerBuilding: 3,
    initialElevatorFloor: 0,
    dispatchStrategy: DispatchStrategy.ETA_ONLY,
  },
  timing: {
    doorOpenTimeMs: 500,
    delayPerFloorMs: 1000, 
    doorTransitionTimeMs: 500,
    floorTravelTimeMs: 500,
  },
  simulation: {
    simulationTickMs: 500,
    simulationSpeedFactor: 1,
    currentTime: 0,
  },
};

export default defaultAppSettings;