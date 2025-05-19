export interface BuildingSettings {
    buildings: number;
    floorsPerBuilding: number;
    elevatorsPerBuilding: number;
    initialElevatorFloor: number;
}

export interface ElevatorTimingSettings {
    doorOpenTimeMs: number;
    delayPerFloorMs: number;
    doorTransitionTimeMs: number;
    floorTravelTimeMs: number;
}

export interface SimulationSettings {
  simulationTickMs: number;
  simulationSpeedFactor: number;
  currentTime?: number;


}

export interface AppSettings {
  buildings: BuildingSettings;
  timing: ElevatorTimingSettings;
  simulation: SimulationSettings;
}

 