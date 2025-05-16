import { ElevatorStateObject, ElevatorTimingSettings, PassengerRequest } from '../types/interfaces';
import { ElevatorState, ElevatorDoorState, RequestStatus } from '../types/enums';
import { Queue } from '../data-structures/Queue';
import { ElevatorTimingManager } from './ElevatorTimingManager';

export class ElevatorFSM implements ElevatorFSM {
  id: string;
  currentFloor: number;
  state: ElevatorState = ElevatorState.IDLE;
  doorState: ElevatorDoorState = ElevatorDoorState.CLOSED;
  queue: Queue<PassengerRequest>;
  timing: ElevatorTimingSettings;
  timingManager: ElevatorTimingManager;

  public readonly designatedBaseFloor: number; // Store the base floor
  constructor(id: string, initialFloor: number, timing: ElevatorTimingSettings) {
    this.id = id;
    this.currentFloor = initialFloor;
    this.designatedBaseFloor = initialFloor;
    this.timing = timing;
    this.queue = new Queue<PassengerRequest>();
    this.timingManager = new ElevatorTimingManager();
  }

  update(currentTime: number): void {

     if (this.timingManager.isPaused()) {
      // console.log(`[${this.id}] FSM update skipped, TimingManager is paused.`);
      return; // Don't process FSM logic if its timers are paused
    }


    if (!this.timingManager.isActionComplete(currentTime)) {
      return;
    }

    // If the queue is empty, return to the base floor
    if (this.queue.isEmpty()) {
      // Check if the elevator is at the base floor
      if (this.state !== ElevatorState.IDLE) {
        this.state = ElevatorState.IDLE;
        this.doorState = ElevatorDoorState.CLOSED;
        this.timingManager.reset();
      }
      // If the elevator is not at the base floor
      if (this.currentFloor !== this.designatedBaseFloor) {
        this.reset(this.designatedBaseFloor);
      } else {
        return;
      }
    }

    const currentRequest = this.queue.peek();
    if (!currentRequest) { return }
    const targetFloor = currentRequest.pickedUp ? currentRequest.destinationFloor : currentRequest.sourceFloor;

    switch (this.state) {
      case ElevatorState.IDLE:
        if (this.currentFloor < targetFloor) {
          this.state = ElevatorState.MOVING_UP;
          this.timingManager.setActionFinishTime(currentTime + this.timing.floorTravelTimeMs);
        } else if (this.currentFloor > targetFloor) {
          this.state = ElevatorState.MOVING_DOWN;
          this.timingManager.setActionFinishTime(currentTime + this.timing.floorTravelTimeMs);
        } else {
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
            currentRequest.status = RequestStatus.COMPLETED
          }
        }
        break;

      case ElevatorState.MOVING_UP:
        this.currentFloor++;
        this.timingManager.setActionFinishTime(currentTime + this.timing.floorTravelTimeMs);
        if (this.currentFloor === targetFloor) {
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
            currentRequest.status = RequestStatus.COMPLETED
          }
        }
        break;

      case ElevatorState.MOVING_DOWN:
        this.currentFloor--;
        this.timingManager.setActionFinishTime(currentTime + this.timing.floorTravelTimeMs);
        if (this.currentFloor === targetFloor) {
          this.state = ElevatorState.STOPPED_AT_FLOOR;
          this.doorState = ElevatorDoorState.OPEN;
          this.timingManager.setDoorOpenEndTime(currentTime + this.timing.doorOpenTimeMs);
          this.timingManager.setPassengerActivityEndTime(currentTime + this.timing.delayPerFloorMs);

          if (!currentRequest.pickedUp) {
            currentRequest.pickedUp = true;
            currentRequest.requestedAt.markPickedUp(currentTime);
          } else {
            currentRequest.requestedAt.markDroppedOff(currentTime);
          }
        }
        break;

      case ElevatorState.STOPPED_AT_FLOOR:
        if (
          this.timingManager.isDoorOpenTimeElapsed(currentTime) &&
          this.timingManager.isPassengerActivityComplete(currentTime)
        ) {
          this.doorState = ElevatorDoorState.CLOSED;

          if (currentRequest.pickedUp && this.currentFloor === currentRequest.destinationFloor) {
            this.queue.dequeue();
          }

          this.state = ElevatorState.IDLE;
          this.doorState = ElevatorDoorState.CLOSED;
          this.timingManager.reset(); 
        }
        break;
    }
  }
  pauseFSM(currentTime: number): void {
    // console.log(`[${this.id}] FSM pause requested at ${currentTime}`);
    this.timingManager.pause(currentTime);
  }
  addStop(request: PassengerRequest): void {
    this.queue.enqueue(request);
  }

  resumeFSM(currentTime: number): void {
    // console.log(`[${this.id}] FSM resume requested at ${currentTime}`);
    this.timingManager.resume(currentTime);
  }

  isFSMPaused(): boolean {
    return this.timingManager.isPaused();
  }
  getNextCriticalTime(): number | null {
    return this.timingManager.getNextCriticalTime();
  }
  calculateETA(targetFloorQuery: number): number {
    let eta = 0;
    let simulatedFloor = this.currentFloor;
    const queueArray = [...this.queue.toArray()];

    for (const request of queueArray) {
      const target = request.pickedUp ? request.destinationFloor : request.sourceFloor;
      const travelFloors = Math.abs(simulatedFloor - target);
      eta += travelFloors * this.timing.floorTravelTimeMs;
      eta += this.timing.delayPerFloorMs;
      simulatedFloor = target;

      if (!request.pickedUp) {
        const dropTravel = Math.abs(simulatedFloor - request.destinationFloor);
        eta += dropTravel * this.timing.floorTravelTimeMs;
        eta += this.timing.delayPerFloorMs;
        simulatedFloor = request.destinationFloor;
      }
    }

    const finalTravel = Math.abs(simulatedFloor - targetFloorQuery);
    eta += finalTravel * this.timing.floorTravelTimeMs;

    return eta;
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