import { Elevator } from "./Elevator";
import type { ElevatorRequest } from "../types/interfaces";

export class ElevatorManager {
  elevators: Elevator[];

  constructor(count: number) {
    this.elevators = Array.from({ length: count }, (_, i) => new Elevator(`E${i + 1}`));
  }

  createRequest(source: number, target: number): ElevatorRequest {
    const request: ElevatorRequest = {
      id: crypto.randomUUID(),
      sourceFloor: source,
      targetFloor: target,
      requestTime: Date.now()
    };

    const selectedElevator = this.elevators.reduce((best, candidate) => {
        const bestETA = best.estimateETA(source);
        const candidateETA = candidate.estimateETA(source);
      
        return candidateETA < bestETA ? candidate : best;
      });
      

    selectedElevator.addRequest(request);
    return request;
  }

  stepAll() {
    this.elevators.forEach(e => e.moveOneStep());
  }
    getStatus() {
        return this.elevators.map(e => ({
        id: e.id,
        currentFloor: e.currentFloor,
        state: e.state,
        queue: e.getStatus()
        }));
    }
    getElevator(id: string) {
        return this.elevators.find(e => e.id === id);
    }
    getElevators() {
        return this.elevators;
    }
    getElevatorByFloor(floor: number) {
        return this.elevators.find(e => e.currentFloor === floor);
    }
    getElevatorByState(state: string) {
        return this.elevators.find(e => e.state === state);
    }
    getElevatorById(id: string) {
        return this.elevators.find(e => e.id === id);
    }
    getElevatorByRequest(request: ElevatorRequest) {
        return this.elevators.find(e => e.queue.includes(request));
    }
    getElevatorByRequestId(requestId: string) {
        return this.elevators.find(e => e.queue.some(r => r.id === requestId));
    }
}
