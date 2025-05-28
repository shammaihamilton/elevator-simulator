import { AppSettings, EffectiveBuildingSettings } from "./settings.interface";
import { IElevatorManager } from "./elevatorManager.interface";
import { DispatchStrategy } from "@/types/enums";

export interface SimulationState {
  // State properties
  managers: IElevatorManager[];
  settings: AppSettings;
  currentTime: number;
  // dispatchStrategy: DispatchStrategy;
  buildingSpecificSettings: Record<number, EffectiveBuildingSettings | null>;
  isPaused: boolean; // Added: Actual pause state
  // Actions
  requestElevator: (
    buildingIndex: number,
    source: number,
    destination: number
  ) => void;
  tick: () => void;
  reset: () => void;
  setDispatchStrategy: (dispatchStrategy: DispatchStrategy) => void;
  pauseSimulation: () => void; // For global pause
  resumeSimulation: () => void; // For global resume
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateBuildingSettings: (
    buildingIndex: number,
    settings: EffectiveBuildingSettings | null
  ) => void;
}
