// src/core/ElevatorTimingManager.ts
import type { IElevatorTimingManager } from '../types/interfaces';


export class ElevatorTimingManager implements IElevatorTimingManager {
  private doorOpenEndTime: number | null = null;
  private passengerActivityEndTime: number | null = null;
  private currentActionFinishTime: number | null = null;

  setDoorOpenEndTime(time: number): void {
    this.doorOpenEndTime = time;
  }

  extendDoorOpenTime(currentTime: number, minimumExtension: number): void {
    const newEndTime = currentTime + minimumExtension;
    if (this.doorOpenEndTime === null || newEndTime > this.doorOpenEndTime) {
      this.doorOpenEndTime = newEndTime;
    }
  }

  setPassengerActivityEndTime(time: number | null): void { // Changed signature
    this.passengerActivityEndTime = time;
  }

  extendPassengerActivityTime(currentTime: number, durationMs: number): void {
    const base = this.passengerActivityEndTime ?? currentTime;
    this.passengerActivityEndTime = base + durationMs;
  }

  setActionFinishTime(time: number | null): void { // Changed signature
    this.currentActionFinishTime = time;
  }

  isDoorOpenTimeElapsed(currentTime: number): boolean {
    return this.doorOpenEndTime !== null && currentTime >= this.doorOpenEndTime;
  }

  isPassengerActivityComplete(currentTime: number): boolean {
    // If no activity is set, it's complete. Otherwise, check time.
    return this.passengerActivityEndTime === null || currentTime >= this.passengerActivityEndTime;
  }

  isActionComplete(currentTime: number): boolean {
    // If no action finish time is set, it's considered complete (or no action is pending). Otherwise, check time.
    return this.currentActionFinishTime === null || currentTime >= this.currentActionFinishTime;
  }

  getDoorOpenEndTime(): number | null {
    return this.doorOpenEndTime;
  }

  getPassengerActivityEndTime(): number | null {
    return this.passengerActivityEndTime;
  }

  getActionFinishTime(): number | null {
    return this.currentActionFinishTime;
  }

  getNextCriticalTime(): number | null {
    const times = [this.doorOpenEndTime, this.passengerActivityEndTime, this.currentActionFinishTime]
      .filter((t): t is number => t !== null); // Filter out nulls correctly
    return times.length ? Math.min(...times) : null;
  }

  reset(): void {
    this.doorOpenEndTime = null;
    this.passengerActivityEndTime = null;
    this.currentActionFinishTime = null;
  }

  clearDoorOpenTimer(): void {
    this.doorOpenEndTime = null;
  }
}