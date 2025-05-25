import { AppSettings as ZodAppSettings } from '@/config/settingsSchema';

export type AppSettings = ZodAppSettings;

export type ElevatorTimingSettings = ZodAppSettings['timing'];
export type BuildingSettings = ZodAppSettings['buildings'];
export type SimulationSettings = ZodAppSettings['simulation'];

// You might still need BuildingSpecificSettings if it's not fully covered by Zod or used differently

export interface BuildingSpecificSettings {
  floorsPerBuilding?: number;
  elevatorsPerBuilding?: number;
  initialElevatorFloor?: number;
  doorOpenTimeMs?: number;
  doorTransitionTimeMs?: number;
  floorTravelTimeMs?: number;
  delayPerFloorMs?: number;
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
 