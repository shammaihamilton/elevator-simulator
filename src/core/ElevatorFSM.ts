
import {
  ElevatorStateObject,
  ElevatorTimingSettings,
  PassengerRequest,
} from "../interfaces";
import {
  ElevatorState,
  ElevatorDoorState,
  RequestStatus,
} from "../types/enums";
import { Queue } from "../data-structures/Queue";
import { ElevatorTimingManager } from "./ElevatorTimingManager";
import { generateId } from "@/utils/idGenerator";
import { calcETA, fullStopMs } from "../utils/etaHelpers";

export class ElevatorFSM implements ElevatorFSM {
  id: string;
  currentFloor: number;
  state: ElevatorState = ElevatorState.IDLE;
  doorState: ElevatorDoorState = ElevatorDoorState.CLOSED;
  queue: Queue<PassengerRequest>;
  timing: ElevatorTimingSettings;
  timingManager: ElevatorTimingManager;
  public readonly designatedBaseFloor: number;

  constructor(
    id: string,
    initialFloor: number,
    timing: ElevatorTimingSettings
  ) {
    this.id = id;
    this.currentFloor = initialFloor;
    this.designatedBaseFloor = initialFloor;
    this.timing = timing;
    this.queue = new Queue<PassengerRequest>();
    this.timingManager = new ElevatorTimingManager(generateId());
  }

  update(currentTime: number): void {
    if (this.timingManager.isPaused() || !this.timingManager.isActionComplete(currentTime)) return;

    if (this.queue.isEmpty()) {
      if (this.state !== ElevatorState.IDLE) {
        this.state = ElevatorState.IDLE;
        this.doorState = ElevatorDoorState.CLOSED;
      }
      return;
    }

    const currentRequest = this.queue.peek();
    if (!currentRequest) return;
    
    const targetFloor = currentRequest.pickedUp ? currentRequest.destinationFloor : currentRequest.sourceFloor;

    switch (this.state) {
      case ElevatorState.IDLE:
        if (this.currentFloor !== targetFloor) {
          this.state = this.currentFloor < targetFloor ? ElevatorState.MOVING_UP : ElevatorState.MOVING_DOWN;
          this.timingManager.setActionFinishTime(currentTime + this.timing.floorTravelTimeMs);
        } else {
          this.handleArrival(currentTime, currentRequest);
        }
        break;

      case ElevatorState.MOVING_UP:
        this.currentFloor++;
        this.timingManager.setActionFinishTime(currentTime + this.timing.floorTravelTimeMs);
        if (this.currentFloor === targetFloor) this.handleArrival(currentTime, currentRequest);
        break;

      case ElevatorState.MOVING_DOWN:
        this.currentFloor--;
        this.timingManager.setActionFinishTime(currentTime + this.timing.floorTravelTimeMs);
        if (this.currentFloor === targetFloor) this.handleArrival(currentTime, currentRequest);
        break;

      case ElevatorState.STOPPED_AT_FLOOR:
        if (this.timingManager.isDoorOpenTimeElapsed(currentTime) && 
            this.timingManager.isPassengerActivityComplete(currentTime)) {
          this.doorState = ElevatorDoorState.CLOSED;
          
          if (currentRequest.pickedUp && this.currentFloor === currentRequest.destinationFloor) {
            this.queue.dequeue();
          }
          
          this.state = ElevatorState.IDLE;
          this.timingManager.reset();
        }
        break;
    }
  }

  private handleArrival(currentTime: number, currentRequest: PassengerRequest): void {
    this.state = ElevatorState.STOPPED_AT_FLOOR;
    this.doorState = ElevatorDoorState.OPEN;
    this.timingManager.setDoorOpenEndTime(currentTime + this.timing.doorOpenTimeMs);
    this.timingManager.setPassengerActivityEndTime(currentTime + this.timing.delayPerFloorMs);

    if (!currentRequest.pickedUp) {
      currentRequest.pickedUp = true;
      currentRequest.requestedAt.markPickedUp(currentTime);
      currentRequest.status = RequestStatus.IN_TRANSIT;
    } else {
      currentRequest.requestedAt.markDroppedOff(currentTime);
      currentRequest.status = RequestStatus.COMPLETED;
    }
  }

  addStop(request: PassengerRequest): void {
    this.queue.enqueue(request);
  }

  pauseFSM(currentTime: number): void {
    this.timingManager.pause(currentTime);
  }

  resumeFSM(currentTime: number): void {
    this.timingManager.resume(currentTime);
  }

  isFSMPaused(): boolean {
    return this.timingManager.isPaused();
  }

  getNextCriticalTime(): number | null {
    return this.timingManager.getNextCriticalTime();
  }

  calculateETA(targetFloor: number, now: number): number {
    return calcETA({
      currentFloor: this.currentFloor,
      currentTime: now,
      targetFloor,
      queue: this.queue.toArray(),
      timing: this.timing,
      state: this.state,
      timingManager: this.timingManager,
    });
  }

  calculateReadyTime(targetFloor: number, now: number): number {
    return this.calculateETA(targetFloor, now) + fullStopMs(this.timing);
  }

  getLoad(): number {
    return 0;
  }

  queueContainsFloor(floorNumber: number): boolean {
    for (const request of this.queue.toArray()) {
      if (!request.pickedUp && request.sourceFloor === floorNumber) return true;
      if (request.pickedUp && request.destinationFloor === floorNumber) return true;
    }
    return false;
  }

  reset(initialFloor: number = 0): void {
    this.currentFloor = initialFloor;
    this.state = ElevatorState.IDLE;
    this.doorState = ElevatorDoorState.CLOSED;
    this.queue.clear();
    this.timingManager.reset();
  }

  stop(): void {
    this.doorState = ElevatorDoorState.CLOSED;
    this.timingManager.reset();
  }

  getId(): string {
    return this.id;
  }

  getCurrentFloor(): number {
    return this.currentFloor;
  }

  getDoorState(): ElevatorDoorState {
    return this.doorState;
  }

  getState(): ElevatorStateObject {
    return {
      id: this.id,
      currentFloor: this.currentFloor,
      state: this.state,
      doorState: this.doorState,
      queue: this.queue.toArray(),
      timing: this.timing,
    };
  }
}

export default ElevatorFSM;