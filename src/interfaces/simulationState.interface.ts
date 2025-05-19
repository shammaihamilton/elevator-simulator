import { AppSettings } from './settings.interface';
import { IElevatorManager } from './elevatorManager.interface';

export interface SimulationState {
  managers: IElevatorManager[]; 
  settings: AppSettings;
  currentTime: number;

  // Actions
  requestElevator: (buildingIndex: number, source: number, destination: number) => void;
  tick: () => void;
  reset: () => void;
  pauseSimulation: () => void; // For global pause
  resumeSimulation: () => void; // For global resume
  // isPaused: () => boolean; // Removed: Use the state property directly
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // State properties
  isPaused: boolean; // Added: Actual pause state
}