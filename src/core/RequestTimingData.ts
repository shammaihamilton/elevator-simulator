// src/core/RequestTimingData.ts

import type { IRequestTimingData } from '../types/interfaces';

export class RequestTimingData implements IRequestTimingData {
  public creationTime: number;
  public assignmentTime: number | null;
  public pickupTime: number | null;
  public dropoffTime: number | null;

  constructor(creationTime: number) {
    this.creationTime = creationTime;
    this.assignmentTime = null;
    this.pickupTime = null;
    this.dropoffTime = null;
  }

  public getWaitTime(currentTime: number): number {
    if (this.pickupTime === null) {
      return currentTime - this.creationTime; // Still waiting
    }
    return this.pickupTime - this.creationTime; // Wait is over
  }

  public getTotalTripTime(currentTime: number): number {
    if (this.dropoffTime === null) {
      return currentTime - this.creationTime; // Trip ongoing
    }
    return this.dropoffTime - this.creationTime; // Trip complete
  }

  public getInElevatorTime(currentTime: number): number {
    if (this.pickupTime === null) {
      return 0; // Not in elevator yet
    }
    if (this.dropoffTime === null) {
      return currentTime - this.pickupTime; // Currently in elevator
    }
    return this.dropoffTime - this.pickupTime; // Trip complete
  }

  public markAssigned(time: number): void {
    this.assignmentTime = time;
  }

  public markPickedUp(time: number): void {
    this.pickupTime = time;
  }

  public markDroppedOff(time: number): void {
    this.dropoffTime = time;
  }
}