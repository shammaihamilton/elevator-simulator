import { MinHeap } from '../data-structures/MinHeap';
import type {
  ElevatorState,
  ElevatorDirection,
  ElevatorDoorState,
  ButtonState,
  ButtonType,
  GlobalSystemState,
  RequestStatus,
  DispatchStrategy
} from './enums';



export interface PassengerRequest {
  id: string;
  sourceFloor: number;
  destinationFloor: number;
  status: RequestStatus;
  assignedElevatorId?: string;
  priority: number;
  timing: IRequestTimingData;
}


export interface IRequestTimingData {
  creationTime: number;
  assignmentTime: number | null;
  pickupTime: number | null;
  dropoffTime: number | null;

  getWaitTime(currentTime: number): number;
  getTotalTripTime(currentTime: number): number;
  getInElevatorTime(currentTime: number): number;

  markAssigned(time: number): void;
  markPickedUp(time: number): void;
  markDroppedOff(time: number): void;
}

export interface IElevatorTimingManager {
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
}


export interface FloorCall {
  id: string;
  floorNumber: number;
  direction: ElevatorDirection;
  timestamp: number;
  isServiced: boolean;
  assignedElevatorId?: string;
  priority: number;
}

// This interface is what ElevatorFSM implements for its state + public methods
// It also serves as the detailed data structure for an elevator.
export interface Elevator { // Kept name 'Elevator' as ElevatorFSM implements it
  id: string;
  currentFloor: number;
  direction: ElevatorDirection;
  state: ElevatorState;
  doorState: ElevatorDoorState;
  passengers: PassengerRequest[];
  upStops: MinHeap<number>;
  downStops: MinHeap<number>;
  targetFloor: number | null;
  capacity: number;
  timing: IElevatorTimingManager;
  // Methods that are part of the ElevatorFSM's public API
  update(currentTime: number): void;
  addStop(floor: number): void;
  boardPassenger(passenger: PassengerRequest, currentTime: number): boolean;
  signalOpenDoor(currentTime: number): void;
  signalCloseDoor(currentTime: number): void;
  signalEmergencyStop(): void;
  resetEmergencyStop(): void;
  calculateETA(targetFloorQuery: number, currentTime: number): number;
  setMaintenance(enable: boolean): void;
  setOutOfService(enable: boolean): void;
  reset(initialFloor?: number): void;
  getLoadFactor(): number; // Added this as it's on FSM
}
export interface Button {
  id: string;
  type: ButtonType;
  floorNumber?: number;
  state: ButtonState;
  elevatorId?: string;
  lastPressedTimestamp?: number;
}

export interface BuildingConfig {
  numberOfFloors: number;
  numberOfElevators: number;
  elevatorCapacity: number;
  initialFloor?: number;       // Optional, defaults to ground floor
  doorOpenTimeMs: number;      // How long doors stay open
  doorTransitionTimeMs: number; // Time for doors to open/close
  floorTravelTimeMs: number;    // Time to travel one floor
  dispatchStrategy: DispatchStrategy;
  simulationTickMs?: number;     // How often the simulation updates (e.g., 100ms)
}

export interface ElevatorSystem {
  config: BuildingConfig;
  elevators: Elevator[];
  pendingRequests: MinHeap<PassengerRequest>; // For full passenger journeys
  buttons: Button[];
  currentTime: number; // Usually in ticks or a discrete simulation time unit
  globalState: GlobalSystemState;
  simulationSpeedFactor: number; // e.g., 1 for real-time based on Ms, 0.5 for slower, 2 for faster
}

// In interfaces.ts
export interface ElevatorSystemConfig {
  numberOfFloors: number;
  numberOfElevators: number;
  elevatorCapacity: number;
  initialFloor?: number; // Optional, defaults to 1 or 0
  doorOpenTimeMs: number;       // How long doors stay open
  doorTransitionTimeMs: number; // Time for doors to open/close
  floorTravelTimeMs: number;    // Time to travel one floor
  dispatchStrategy: DispatchStrategy;
  simulationTickMs?: number;    // How often the simulation updates
}

export interface ISimulationLoop {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  isRunning: boolean;
  setSimulationSpeed(factor: number): void;
  getSystemState(): ElevatorSystem;
  triggerEmergency(type: GlobalSystemState): void;
  resetEmergency(): void;
  addPassengerRequest(
    sourceFloor: number,
    destinationFloor: number,
    requestedDirection: "UP" | "DOWN",
    priority?: number
  ): string;
  addElevatorPanelRequest(elevatorId: string, destinationFloor: number): void;
  cleanup(): void;
}

