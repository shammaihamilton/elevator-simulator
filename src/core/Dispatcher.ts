// Dispatcher.ts
import type { Elevator, FloorCall, BuildingConfig } from '../types/interfaces';
import { ElevatorState, DispatchStrategy } from '../types/enums';

export abstract class Dispatcher {
  abstract selectElevator(elevators: Elevator[], call: FloorCall): Elevator | null;

  protected isElevatorAvailable(elevator: Elevator): boolean {
    return elevator.state !== ElevatorState.MAINTENANCE 
      && elevator.state !== ElevatorState.OUT_OF_SERVICE
      && elevator.state !== ElevatorState.EMERGENCY_STOP
      && elevator.state !== ElevatorState.OVERLOADED;
  }

  protected calculateScore(elevator: Elevator, call: FloorCall): number {
    if (!this.isElevatorAvailable(elevator)) return Infinity;
    return Math.abs(elevator.currentFloor - call.floorNumber);
  }
}

export class ClosestCabinDispatcher extends Dispatcher {
  selectElevator(elevators: Elevator[], call: FloorCall): Elevator | null {
    const available = elevators.filter(e => this.isElevatorAvailable(e));
    
    return available.reduce((best, curr) => {
      if (!best) return curr;
      
      // Consider direction compatibility
      const bestScore = this.calculateScore(best, call);
      const currScore = this.calculateScore(curr, call);

      // Prefer elevators going in the same direction
      if (curr.direction === call.direction && best.direction !== call.direction) {
        return curr;
      }
      if (best.direction === call.direction && curr.direction !== call.direction) {
        return best;
      }

      // If directions match or neither matches, choose by distance
      return currScore < bestScore ? curr : best;
    }, null as Elevator | null);
  }
}

export class LeastStopsDispatcher extends Dispatcher {
  selectElevator(elevators: Elevator[], call: FloorCall): Elevator | null {
    const available = elevators.filter(e => this.isElevatorAvailable(e));
    
    return available.reduce((least, curr) => {
      if (!least) return curr;
      
      // Count actual stops (not just passengers)
      const currStops = curr.upStops.size + curr.downStops.size;
      const leastStops = least.upStops.size + least.downStops.size;
      
      // Consider direction and load
      const currLoad = curr.passengers.length / curr.capacity;
      const leastLoad = least.passengers.length / least.capacity;
      
      // Prefer elevators that are:
      // 1. Going in the same direction as the call
      // 2. Have fewer stops
      // 3. Have lower passenger load
      
      if (curr.direction === call.direction && least.direction !== call.direction) {
        return curr;
      }
      if (least.direction === call.direction && curr.direction !== call.direction) {
        return least;
      }
      
      // If directions are equal or both different, compare stops and load
      if (currStops === leastStops) {
        return currLoad < leastLoad ? curr : least;
      }
      return currStops < leastStops ? curr : least;
    }, null as Elevator | null);
  }
}

export function createDispatcher(config: BuildingConfig): Dispatcher {
  switch (config.dispatchStrategy) {
    case DispatchStrategy.CLOSEST_CABIN:
      return new ClosestCabinDispatcher();
    case DispatchStrategy.LEAST_STOPS:
      return new LeastStopsDispatcher();
    default:
      return new ClosestCabinDispatcher(); // Default strategy
  }
}