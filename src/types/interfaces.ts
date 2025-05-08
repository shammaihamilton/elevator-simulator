// types/interfaces.ts
import type { ElevatorState } from "./enums";

export interface ElevatorRequest {
    id: string;
    sourceFloor: number; // Floor where the request originated
    targetFloor: number; // Floor the passenger wants to go to
    requestTime: number; // Timestamp of the request
    // Add internal state for tracking
    pickedUp?: boolean; // Has the passenger been picked up from sourceFloor?
}

export interface ElevatorStatus {
    id: string;
    currentFloor: number;
    state: ElevatorState;
    queue: ElevatorRequest[];
    // Add destination for clarity in status
    destinationFloor: number | null;
}