import { Queue } from "../data-structures/Queue";
import { PassengerRequest } from "./passengerRequest.interface";
import { ElevatorTimingSettings } from "./settings.interface";
import { ElevatorState, ElevatorDoorState } from "../types/enums/elevator.enums";
import  IElevatorTimingManager  from "./elevatorTimingManager.interface";



export interface IElevatorFSM {
  id: string;
  currentFloor: number;
  state: ElevatorState;
  doorState: ElevatorDoorState;
  timing: ElevatorTimingSettings;
  queue: Queue<PassengerRequest>;
  timingManager: IElevatorTimingManager;

  queueContainsFloor(floor: number): boolean;
  update(currentTime: number): void;
  addStop(request: PassengerRequest): void;
  calculateETA(targetFloorQuery: number, currentTime: number): number;
  reset(initialFloor?: number): void;
  pauseFSM(currentTime: number): void;    // Added
  resumeFSM(currentTime: number): void;   // Added
  isFSMPaused(): boolean;                 // Added
  getState(): ElevatorStateObject;
  getId(): string;
  getCurrentFloor(): number;
  getDoorState(): ElevatorDoorState;
}

export interface ElevatorStateObject {
  id: string;
  currentFloor: number;
  state: ElevatorState;
  doorState: ElevatorDoorState;
  queue: PassengerRequest[];
  timing: ElevatorTimingSettings;
}