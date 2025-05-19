import { ElevatorStateObject, IElevatorFSM } from "./elevatorFSM.inteface";
import { PassengerRequest } from "./passengerRequest.interface";

export interface SelectionConfig {
  queueWeightMs: number;
  wrongDirPenaltyMs: number;
  capacityFactorMs: number;
}

export interface IElevatorManager {
  id: string;
  elevators: IElevatorFSM[];
  isPaused: boolean; // Added

   config: SelectionConfig;
  handleRequest(request: PassengerRequest, currentTime: number): void;
  tick(currentTime: number): void;
  reset(): void;
  getElevatorStates(): ElevatorStateObject[];
  getElevatorById(id: string): IElevatorFSM | undefined;
  pause(id: string): void;
  resume(id: string): void;
}