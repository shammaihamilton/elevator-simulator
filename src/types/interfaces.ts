

// elevator-simulator/src/types/interfaces.ts
import { ElevatorManager } from '@/core/ElevatorManager';
import { ElevatorState, ElevatorDoorState, RequestStatus } from '../types/enums';
import { Queue } from '@/data-structures/Queue';


export interface SimulationState {
  managers: ElevatorManager[]; 
  settings: AppSettings;
  currentTime: number;

  // Actions
  requestElevator: (buildingIndex: number, source: number, destination: number) => void;
  tick: () => void;
  reset: () => void;
  stop: () => void;
}

export interface PassengerRequest {
  id: string;
  status: RequestStatus;
  sourceFloor: number;
  destinationFloor: number;
  assignedElevatorId?: string;
  estimatedServiceTimeMs?: number;
  pickedUp?: boolean;
  requestedAt: IRequestTimingData;
}


export interface BuildingSettings {
    buildings: number;
    floorsPerBuilding: number;
    elevatorsPerBuilding: number;
    initialElevatorFloor: number;
}

export interface ElevatorTimingSettings {
    doorOpenTimeMs: number;
    timePerFloorMs: number;
    delayPerFloorMs: number;
    doorTransitionTimeMs: number;
    floorTravelTimeMs: number;
}

export interface SimulationSettings {
  simulationTickMs: number;
  simulationSpeedFactor: number;
  currentTime?: number;


}

export interface AppSettings {
  building: BuildingSettings;
  timing: ElevatorTimingSettings;
  simulation: SimulationSettings;
}

export interface IElevatorManager {
  id: string;
  elevators: IElevatorFSM[];
  handleRequest(request: PassengerRequest): void;
  tick(currentTime: number): void;
  reset(): void;
  getElevatorStates(): ElevatorStateObject[];
  getElevatorById(id: string): IElevatorFSM | undefined;
  getElevatorByIndex(index: number): IElevatorFSM | undefined;
  getElevatorStatesByBuilding(buildingId: string): IElevatorFSM[];
  stop(id: string): void;
  stopAll(): void;
} 

export interface IElevatorFSM {
  id: string;
  currentFloor: number;
  state: ElevatorState;
  doorState: ElevatorDoorState;
  timing: ElevatorTimingSettings;
  queue: Queue<PassengerRequest>;
  timingManager: IElevatorTimingManager;


  update(currentTime: number): void;
  addStop(request: PassengerRequest): void;
  calculateETA(targetFloorQuery: number, currentTime: number): number;
  reset(initialFloor?: number): void;
  stop(): void;
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


export interface IRequestTimingData {
  requestedAt: number;
  pickupTime: number | null;
  dropoffTime: number | null;

  getWaitTime(currentTime: number): number;
  getTotalTripTime(currentTime: number): number;
  getInElevatorTime(currentTime: number): number;

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
