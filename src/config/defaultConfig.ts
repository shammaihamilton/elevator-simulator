import { AppSettings } from "@/interfaces";

export const defaultAppSettings: AppSettings = {
  buildings: {
    numberOfBuildings: 1,
    floorsPerBuilding: 8,
    elevatorsPerBuilding: 3,
    initialElevatorFloor: 0,
  },
  // timing: {
  //   doorOpenTimeMs: 500,
  //   delayPerFloorMs: 500,
  //   doorTransitionTimeMs: 500,
  //   floorTravelTimeMs: 500,
  // },
  timing: {
    floorTravelTimeMs: 0.5,
    doorTransitionTimeMs: 0.4,
    doorOpenTimeMs: 0.4,
    delayPerFloorMs: 0.4,
  },
  simulation: {
    simulationTickMs: 500,
    simulationSpeedFactor: 1,
    currentTime: 0,
  },
};

export default defaultAppSettings;
