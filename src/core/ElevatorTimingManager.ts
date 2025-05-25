
import { IElevatorTimingManager } from '../interfaces';

export class ElevatorTimingManager implements IElevatorTimingManager {
  private doorOpenEndTime: number | null = null;
  private passengerActivityEndTime: number | null = null;
  private actionFinishTime: number | null = null;
  private elevatorId: string;
  private pausedAt: number | null = null;
  
  constructor(elevatorId: string) {
    this.elevatorId = elevatorId;
  }

  setPassengerActivityEndTime(finishTime: number): void {
    this.passengerActivityEndTime = finishTime;
     // Typically, passenger activity defines the end of a "STOPPED" action
    if (this.actionFinishTime === null || finishTime > this.actionFinishTime) {
        this.actionFinishTime = finishTime;
        console.log(`[${this.elevatorId}-TimingManager] STOPPED actionFinishTime updated to: ${finishTime} via passenger activity`);
    }
  }

  extendPassengerActivityTime(currentTime: number, durationMs: number): void {
    const newEndTime = currentTime + durationMs;
    if (this.passengerActivityEndTime === null || newEndTime > this.passengerActivityEndTime) {
      this.passengerActivityEndTime = newEndTime;
    }
  }

  setActionFinishTime(time: number | null): void {
    this.actionFinishTime = time;
  }

  isDoorOpenTimeElapsed(currentTime: number): boolean {
    return this.doorOpenEndTime === null || currentTime >= this.doorOpenEndTime;
  }

  isPassengerActivityComplete(currentTime: number): boolean {
    return this.passengerActivityEndTime === null || currentTime >= this.passengerActivityEndTime;
  }

   isActionComplete(currentTime: number): boolean {
    if (this.pausedAt !== null) return false; // If paused, current action is not completing
    const isComplete = this.actionFinishTime === null || currentTime >= this.actionFinishTime;
    // if (!isComplete && this.pausedAt === null) {
      // console.log(`[${this.elevatorId}-TM] Action not complete. Current: ${currentTime}, Finish: ${this.actionFinishTime}`);
    // }
    return isComplete;
  }
  getDoorOpenEndTime(): number | null {
    return this.doorOpenEndTime;
  }

  getPassengerActivityEndTime(): number | null {
    return this.passengerActivityEndTime;
  }

  getActionFinishTime(): number | null {
    return this.actionFinishTime;
  }

  getNextCriticalTime(): number | null {

     if (this.pausedAt !== null) return null;

    const times = [this.doorOpenEndTime, this.passengerActivityEndTime, this.actionFinishTime]
      .filter((time): time is number => time !== null);
    
    return times.length > 0 ? Math.min(...times) : null;
  }

  reset(): void {
    this.doorOpenEndTime = null;
    this.passengerActivityEndTime = null;
    this.actionFinishTime = null;
    this.pausedAt = null
  }

  clearDoorOpenTimer(): void {
    this.doorOpenEndTime = null;
  }

  pause(currentTime: number): void {
    if (this.pausedAt === null) { // Only pause if not already paused
      this.pausedAt = currentTime;
      // console.log(`[${this.elevatorId}-TM] Paused at: ${currentTime}`);
    }
  }

  resume(currentTime: number): void {
    if (this.pausedAt !== null) {
      const elapsedPausedTime = currentTime - this.pausedAt;
      // console.log(`[${this.elevatorId}-TM] Resuming. Paused for: ${elapsedPausedTime}ms`);

      if (elapsedPausedTime > 0) { // Only adjust if time actually passed
        if (this.doorOpenEndTime !== null) {
          this.doorOpenEndTime += elapsedPausedTime;
        }
        if (this.passengerActivityEndTime !== null) {
          this.passengerActivityEndTime += elapsedPausedTime;
        }
        if (this.actionFinishTime !== null) {
          this.actionFinishTime += elapsedPausedTime;
        }
      }
      this.pausedAt = null; // Clear pause state
    }
  }

  isPaused(): boolean {
    return this.pausedAt !== null;
  }
}