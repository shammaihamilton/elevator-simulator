

import { IRequestTimingData } from '../interfaces';

export class RequestTimingData implements IRequestTimingData {
  requestedAt: number;
  pickupTime: number | null = null;
  dropoffTime: number | null = null;

  constructor(creationTime: number) {
    this.requestedAt = creationTime;
  }


  // getWaitTime(currentTime: number): number {
  //   if (this.pickupTime === null) {
  //     // Still waiting to be picked up
  //     return currentTime - this.requestedAt;
  //   }
  //   // Return the actual wait time until pickup
  //   console.log('pickupTime', this.pickupTime, 'requestedAt', this.requestedAt);
  //   return this.pickupTime - this.requestedAt;
  // }

  // getTotalTripTime(currentTime: number): number {
  //   if (this.dropoffTime === null) {
  //     // Trip is not complete yet
  //     return currentTime - this.requestedAt;
  //   }
  //   console.log('pickupTime', this.pickupTime, 'requestedAt', this.requestedAt);
  //   // Return the actual total trip time
  //   return this.dropoffTime - this.requestedAt;
     
  // }

  // getInElevatorTime(currentTime: number): number {
  //   if (this.pickupTime === null) {
  //     // Not in elevator yet
  //     return 0;
  //   }
    
  //   if (this.dropoffTime === null) {
  //     // Still in elevator
  //     return currentTime - this.pickupTime;
  //   }
    
  //   // Return actual time spent in elevator
  //   return this.dropoffTime - this.pickupTime;
  // }

  markPickedUp(time: number): void {
    this.pickupTime = time;
    console.log('markPickedUp', this.pickupTime, 'requestedAt', this.requestedAt);

  }

  markDroppedOff(time: number): void {
    this.dropoffTime = time;
      console.log('markDroppedOff', this.dropoffTime, 'requestedAt', this.requestedAt);
  }
}