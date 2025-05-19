




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
export interface BuildingSpecificSettings {
  floorsPerBuilding?: number;
  elevatorsPerBuilding?: number;
  initialElevatorFloor?: number;
  doorOpenTimeMs?: number;
  doorTransitionTimeMs?: number;
  floorTravelTimeMs?: number;
  delayPerFloorMs?: number;
}

export interface AppSettings {
  buildings: BuildingSettings;
  timing: ElevatorTimingSettings;
  simulation: SimulationSettings;
}

export interface BuildingSpecificSettings {
  floorsPerBuilding?: number;
  elevatorsPerBuilding?: number;
  initialElevatorFloor?: number;
  doorOpenTimeMs?: number;
  delayPerFloorMs?: number;
  doorTransitionTimeMs?: number;
  floorTravelTimeMs?: number;
}
export interface EffectiveBuildingSettings {
  floorsPerBuilding: number;
  elevatorsPerBuilding: number;
  initialElevatorFloor: number;
  doorOpenTimeMs: number;
  delayPerFloorMs: number;
  doorTransitionTimeMs: number;
  floorTravelTimeMs: number;
}
 