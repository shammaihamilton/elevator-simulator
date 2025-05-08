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
  requestTimestamp: number;
  pickupTimestamp?: number;
  dropoffTimestamp?: number;
  status: RequestStatus;
  assignedElevatorId?: string;
  priority: number;
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

export interface Elevator {
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
  doorOpenTimer?: number;
  maintenanceLog?: string[];
}

export interface BuildingConfig {
    numberOfFloors: number;
    numberOfElevators: number;
    elevatorCapacity: number;
    doorOpenTimeMs: number;       // How long doors stay open
    doorTransitionTimeMs: number; // Time for doors to open/close
    floorTravelTimeMs: number;    // Time to travel one floor
    dispatchStrategy: DispatchStrategy;
    simulationTickMs?: number;     // How often the simulation updates (e.g., 100ms)
  }

export interface Button {
  id: string;
  type: ButtonType;
  floorNumber?: number;
  state: ButtonState;
  elevatorId?: string;
}

export interface ElevatorSystem {
    config: BuildingConfig;
    elevators: Elevator[];
    pendingRequests: MinHeap<PassengerRequest>; // For full passenger journeys
    // pendingFloorCalls: MinHeap<FloorCall>; // Alternative: queue floor calls separately
    buttons: Button[];
    currentTime: number; // Usually in ticks or a discrete simulation time unit
    globalState: GlobalSystemState;
    simulationSpeedFactor: number; // e.g., 1 for real-time based on Ms, 0.5 for slower, 2 for faster
  }
