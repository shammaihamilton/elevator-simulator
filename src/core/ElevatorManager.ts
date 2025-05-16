
// core/ElevatorManager.ts
import { IElevatorFSM, ElevatorStateObject, PassengerRequest, IElevatorManager } from '../types/interfaces';


export class ElevatorManager implements IElevatorManager {
  id: string;
  elevators: IElevatorFSM[];
  isPaused: boolean = false; // Added

  constructor(elevators: IElevatorFSM[]) {
    this.id = elevators[0].id.split('-')[0]; // Assuming all elevators have the same prefix
    this.elevators = elevators;
  }

  handleRequest(request : PassengerRequest): void {
    const { sourceFloor, requestedAt } = request;
    const bestElevator = this.elevators.reduce((best, current) => {
      const bestETA = best.calculateETA(sourceFloor, requestedAt.requestedAt);
      const currentETA = current.calculateETA(sourceFloor, requestedAt.requestedAt);
      return currentETA < bestETA ? current : best;
    });
    bestElevator.addStop(request);
  }

  tick(currentTime: number): void {
    this.elevators.forEach((elevator) => elevator.update(currentTime));
  }
  reset(): void {
    this.elevators.forEach((elevator) => elevator.reset());
  }
  getElevatorStates():ElevatorStateObject[] {
    const elevatorStates: ElevatorStateObject[] = this.elevators.map((elevator) => elevator.getState());
    return elevatorStates;
  }
  getElevatorById(id: string): IElevatorFSM | undefined {
    return this.elevators.find((elevator) => elevator.id === id);
  }

  getElevatorStatesByBuilding(buildingId: string): IElevatorFSM[] {
    return this.elevators.filter((elevator) => elevator.id.startsWith(buildingId));
  }

  pause(id: string): void {
    const elevator = this.getElevatorById(id);
    if (elevator) {
      elevator.pauseFSM(Date.now());
    }
  }
  resume(id: string): void {
    const elevator = this.getElevatorById(id);
    if (elevator) {
      elevator.resumeFSM(Date.now());
    }
  }

}