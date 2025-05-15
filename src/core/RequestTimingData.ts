// // src/core/RequestTimingData.ts

// import type { IRequestTimingData } from '../types/interfaces';

// export class RequestTimingData implements IRequestTimingData {
//   public creationTime: number;
//   public pickupTime: number | null;
//   public dropoffTime: number | null;

//   constructor(creationTime: number) {
//     this.creationTime = creationTime;
//     this.pickupTime = null;
//     this.dropoffTime = null;
//   }

//   public getWaitTime(currentTime: number): number {
//     if (this.pickupTime === null) {
//       return currentTime - this.creationTime; // Still waiting
//     }
//     return this.pickupTime - this.creationTime; // Wait is over
//   }

//   public getTotalTripTime(currentTime: number): number {
//     if (this.dropoffTime === null) {
//       return currentTime - this.creationTime; // Trip ongoing
//     }
//     return this.dropoffTime - this.creationTime; // Trip complete
//   }

//   public getInElevatorTime(currentTime: number): number {
//     if (this.pickupTime === null) {
//       return 0; // Not in elevator yet
//     }
//     if (this.dropoffTime === null) {
//       return currentTime - this.pickupTime; // Currently in elevator
//     }
//     return this.dropoffTime - this.pickupTime; // Trip complete
//   }



//   public markPickedUp(time: number): void {
//     this.pickupTime = time;
//   }

//   public markDroppedOff(time: number): void {
//     this.dropoffTime = time;
//   }
// }
import { IRequestTimingData } from '../types/interfaces';

export class RequestTimingData implements IRequestTimingData {
  requestedAt: number;
  pickupTime: number | null = null;
  dropoffTime: number | null = null;

  constructor(creationTime: number) {
    this.requestedAt = creationTime;
  }

  getWaitTime(currentTime: number): number {
    if (this.pickupTime === null) {
      // Still waiting to be picked up
      return currentTime - this.requestedAt;
    }
    // Return the actual wait time until pickup
    return this.pickupTime - this.requestedAt;
  }

  getTotalTripTime(currentTime: number): number {
    if (this.dropoffTime === null) {
      // Trip is not complete yet
      return currentTime - this.requestedAt;
    }
    // Return the actual total trip time
    return this.dropoffTime - this.requestedAt;
  }

  getInElevatorTime(currentTime: number): number {
    if (this.pickupTime === null) {
      // Not in elevator yet
      return 0;
    }
    
    if (this.dropoffTime === null) {
      // Still in elevator
      return currentTime - this.pickupTime;
    }
    
    // Return actual time spent in elevator
    return this.dropoffTime - this.pickupTime;
  }

  markPickedUp(time: number): void {
    this.pickupTime = time;
  }

  markDroppedOff(time: number): void {
    this.dropoffTime = time;
  }
}