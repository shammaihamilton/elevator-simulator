
export default interface IElevatorTimingManager {
  setDoorOpenEndTime(time: number): void;
  extendDoorOpenTime(currentTime: number, minimumExtension: number): void;

  setPassengerActivityEndTime(time: number | null): void; // Changed: number -> number | null
  extendPassengerActivityTime(currentTime: number, durationMs: number): void;

  setActionFinishTime(time: number | null): void; // Changed: number -> number | null

  isDoorOpenTimeElapsed(currentTime: number): boolean;
  isPassengerActivityComplete(currentTime: number): boolean;
  isActionComplete(currentTime: number): boolean;

  getDoorOpenEndTime(): number | null;
  getPassengerActivityEndTime(): number | null;
  getActionFinishTime(): number | null;
  getNextCriticalTime(): number | null;

  reset(): void;
  clearDoorOpenTimer(): void;
  pause(currentTime: number): void;   
  resume(currentTime: number): void;  
  isPaused(): boolean;   
}
