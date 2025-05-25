import { AppSettings as ZodAppSettings } from '@/config/settingsSchema';
import { DispatchStrategy } from '@/types/enums';

export type AppSettings = ZodAppSettings;

// Type aliases for convenience
export type ElevatorTimingSettings = ZodAppSettings['timing'];
export type BuildingSettings = ZodAppSettings['buildings'];
export type SimulationSettings = ZodAppSettings['simulation'];

// Form data interface for building configuration dialog
export interface BuildingFormData {
  floorsPerBuilding: number;
  elevatorsPerBuilding: number;
  dispatchStrategy: DispatchStrategy;
  initialElevatorFloor: number;
  doorOpenTimeMs: number;
  doorTransitionTimeMs: number;
  floorTravelTimeMs: number;
  delayPerFloorMs: number;
}

// For components that need effective settings (combining building + timing)
export interface EffectiveBuildingSettings {
  floorsPerBuilding: number;
  elevatorsPerBuilding: number;
  initialElevatorFloor: number;
  doorOpenTimeMs: number;
  delayPerFloorMs: number;
  doorTransitionTimeMs: number;
  floorTravelTimeMs: number;
  dispatchStrategy: DispatchStrategy;
}