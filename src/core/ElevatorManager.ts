
// core/ElevatorManager.ts
import { ElevatorState, DispatchMethod } from '@/types/enums';
import { IElevatorFSM, ElevatorStateObject, PassengerRequest, IElevatorManager, SelectionConfig } from '../interfaces';




export class ElevatorManager implements IElevatorManager {
  id: string;
  elevators: IElevatorFSM[];
  isPaused: boolean = false; // Added
  config: SelectionConfig;
  private mode: DispatchMethod


  constructor(elevators: IElevatorFSM[], cfg?: Partial<SelectionConfig>) {
    if (!elevators.length) throw new Error('ElevatorManager requires at least one car');
    this.id = elevators[0].id.split('-')[0];
    this.elevators = elevators;
    this.config = {                                  // defaults
      queueWeightMs        : 1000,
      wrongDirPenaltyMs    : 5000,
      capacityFactorMs     : 2000,
      ...cfg
    };
    this.mode = DispatchMethod.ETA_ONLY 
  }

  handleRequest(req: PassengerRequest, now: number): void {
    const best = this.elevators.reduce((bestCar, curCar) => {
      return this.metric(curCar, req, now) < this.metric(bestCar, req, now)
        ? curCar
        : bestCar;
    });

    best.addStop(req);
  }

    setDispatchMode(mode: DispatchMethod) {
    this.mode = mode;
  }
  private metric(car: IElevatorFSM, req: PassengerRequest, now: number): number {
    if (this.mode === DispatchMethod.ETA_ONLY) {
      return car.calculateETA(req.sourceFloor, now);
    }
    return this.scoredMetric(car, req, now);
  }

  /* score = ETA + queue penalty + direction penalty + capacity penalty */
  private scoredMetric(car: IElevatorFSM, req: PassengerRequest, now: number): number {
    const { queueWeightMs, wrongDirPenaltyMs, capacityFactorMs } = this.config;

    /* if the car is already scheduled to stop here, ignore it
       (avoids duplicate requests) */
    if (car.queueContainsFloor(req.sourceFloor)) return Number.POSITIVE_INFINITY;

    // 1 ▸ raw ETA to pickup
    const eta = car.calculateETA(req.sourceFloor, now);

    // 2 ▸ queue length penalty
    const queuePenalty = (car.queue as any).length?.()   // support Queue API or array‑like
      ? (car.queue as any).length() * queueWeightMs
      : car.queue.length()          * queueWeightMs;       // fallback to custom size()

    // 3 ▸ moving in wrong direction?
    const wrongDir = (
      (car.state === ElevatorState.MOVING_UP   && car.getCurrentFloor() > req.sourceFloor) ||
      (car.state === ElevatorState.MOVING_DOWN && car.getCurrentFloor() < req.sourceFloor)
    ) ? wrongDirPenaltyMs : 0;

    // 4 ▸ capacity penalty (optional getLoad(): 0–1)
    const load     = (car as any).getLoad?.() ?? 0;
    const capPen   = load * capacityFactorMs;

    return eta + queuePenalty + wrongDir + capPen;
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