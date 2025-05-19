import { AppSettings, BuildingSpecificSettings } from "./settings.interface";
import { IElevatorManager } from "./elevatorManager.interface";

export interface SimulationState {
  // State properties
  managers: IElevatorManager[];
  settings: AppSettings;
  currentTime: number;
  buildingSpecificSettings: Record<number, BuildingSpecificSettings | null>;
  isPaused: boolean; // Added: Actual pause state
  // Actions
  requestElevator: (
    buildingIndex: number,
    source: number,
    destination: number
  ) => void;
  tick: () => void;
  reset: () => void;
  pauseSimulation: () => void; // For global pause
  resumeSimulation: () => void; // For global resume
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateBuildingSettings: (
    buildingIndex: number,
    settings: BuildingSpecificSettings | null
  ) => void;

}


