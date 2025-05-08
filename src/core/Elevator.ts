// src/core/ElevatorFSM.ts
// Manages the state and behavior of a single elevator using a Finite State Machine (FSM).

import { ElevatorState, ElevatorDirection, ElevatorDoorState, RequestStatus } from '../types/enums';
import type { Elevator, PassengerRequest, BuildingConfig } from '../types/interfaces';
import { MinHeap } from '../data-structures/MinHeap';
import { ascNumberComparator, descNumberComparator } from '../utils/comparators';

const PASSENGER_ACTIVITY_TIME_MS_PER_PERSON = 500;
const DOOR_OPEN_BUTTON_MINIMAL_TIME = 1000;
const MAX_ETA_SIMULATION_ITERATIONS = 100;
// Heuristic factor: Represents the average delay added per floor passed due to potential future stops.
// Adjust this value based on simulation tuning (e.g., 0.1 means add 10% of a standard stop time per floor passed).
const POTENTIAL_STOP_PENALTY_FACTOR = 0.08; 

export class ElevatorFSM implements Elevator {
  id: string;
  currentFloor: number = 1;
  direction: ElevatorDirection = ElevatorDirection.IDLE;
  state: ElevatorState = ElevatorState.IDLE;
  doorState: ElevatorDoorState = ElevatorDoorState.CLOSED;
  passengers: PassengerRequest[] = [];
  upStops: MinHeap<number>;
  downStops: MinHeap<number>; // With descNumberComparator, acts like a MaxHeap
  targetFloor: number | null = null;
  capacity: number;

  private config: Pick<BuildingConfig, 'doorTransitionTimeMs' | 'doorOpenTimeMs' | 'floorTravelTimeMs'>;
  private currentActionFinishTime: number | null = null;
  doorOpenTimer?: number;
  maintenanceLog: string[] = [];
  
  private passengerActivityEndTime: number | null = null;

  constructor(
    id: string,
    capacity: number,
    initialFloor: number = 1,
    timingConfig: Pick<BuildingConfig, 'doorTransitionTimeMs' | 'doorOpenTimeMs' | 'floorTravelTimeMs'>
  ) {
    this.id = id;
    this.capacity = capacity;
    this.currentFloor = initialFloor;
    this.config = timingConfig;
    this.upStops = new MinHeap<number>(ascNumberComparator);
    this.downStops = new MinHeap<number>(descNumberComparator);
    this.targetFloor = null;
    this.currentActionFinishTime = null;
    this.passengerActivityEndTime = null;
  }

  // Main update method called each simulation tick to drive the FSM.
  public update(currentTime: number): void {
    if (this.state === ElevatorState.MAINTENANCE || this.state === ElevatorState.OUT_OF_SERVICE) return;
    
    const actionEndTime = Math.max(this.currentActionFinishTime ?? -1, this.passengerActivityEndTime ?? -1);
    if (actionEndTime > currentTime) return;
    
    if (this.currentActionFinishTime && currentTime >= this.currentActionFinishTime) this.currentActionFinishTime = null;
    if (this.passengerActivityEndTime && currentTime >= this.passengerActivityEndTime) this.passengerActivityEndTime = null;
    
    switch (this.state) {
      case ElevatorState.IDLE: this.handleIdleState(currentTime); break;
      case ElevatorState.MOVING_UP:
      case ElevatorState.MOVING_DOWN: this.handleMovingState(currentTime); break;
      case ElevatorState.STOPPED_AT_FLOOR: this.handleStoppedAtFloorState(currentTime); break;
      case ElevatorState.DOOR_OPENING: this.handleDoorOpeningState(currentTime); break;
      case ElevatorState.DOOR_OPEN: this.handleDoorOpenState(currentTime); break;
      case ElevatorState.DOOR_CLOSING: this.handleDoorClosingState(currentTime); break;
      case ElevatorState.EMERGENCY_STOP: break;
      default: this.logError(`Unknown state ${this.state}`);
    }
  }

  // Handles behavior when the elevator is IDLE.
  private handleIdleState(currentTime: number): void {
    this.determineNextTarget();
    if (this.targetFloor !== null) {
      if (this.targetFloor === this.currentFloor) {
        this.consumeStopAtCurrentFloor();
        this.setState(ElevatorState.STOPPED_AT_FLOOR);
      } else {
        this.direction = this.targetFloor > this.currentFloor ? ElevatorDirection.UP : ElevatorDirection.DOWN;
        this.setState(this.direction === ElevatorDirection.UP ? ElevatorState.MOVING_UP : ElevatorState.MOVING_DOWN);
        this.currentActionFinishTime = currentTime + this.config.floorTravelTimeMs;
      }
    }
  }

  // Handles behavior when the elevator is MOVING (called when one floor travel is complete).
  private handleMovingState(currentTime: number): void {
    this.currentFloor += (this.direction === ElevatorDirection.UP ? 1 : -1);
    
    if (this.shouldStopAtCurrentFloor()) {
      this.consumeStopAtCurrentFloor();
      this.setState(ElevatorState.STOPPED_AT_FLOOR);
    } else {
      if(this.currentFloor === this.targetFloor) {
           this.determineNextTarget();
           if(this.targetFloor !== null && this.targetFloor !== this.currentFloor) {
               const newDirection = this.targetFloor > this.currentFloor ? ElevatorDirection.UP : ElevatorDirection.DOWN;
               if (newDirection !== this.direction) this.direction = newDirection;
               this.setState(this.direction === ElevatorDirection.UP ? ElevatorState.MOVING_UP : ElevatorState.MOVING_DOWN);
               this.currentActionFinishTime = currentTime + this.config.floorTravelTimeMs;
           } else {
               this.setState(ElevatorState.IDLE);
               this.direction = ElevatorDirection.IDLE;
           }
      } else {
          this.currentActionFinishTime = currentTime + this.config.floorTravelTimeMs;
      }
    }
  }

  // Helper method to check if the elevator should stop at the current floor.
  private shouldStopAtCurrentFloor(): boolean {
    if (this.upStops.peek() === this.currentFloor) return true;
    if (this.downStops.peek() === this.currentFloor) return true;
    return this.passengers.some(p => p.destinationFloor === this.currentFloor);
  }

  // Handles behavior when the elevator has just STOPPED_AT_FLOOR.
  private handleStoppedAtFloorState(currentTime: number): void {
    this.setState(ElevatorState.DOOR_OPENING);
    this.doorState = ElevatorDoorState.OPENING;
    this.currentActionFinishTime = currentTime + this.config.doorTransitionTimeMs;
    this.targetFloor = null; // Clear segment target upon stopping.
  }

  // Handles behavior when the doors have finished OPENING.
  private handleDoorOpeningState(currentTime: number): void {
    this.setState(ElevatorState.DOOR_OPEN);
    this.doorState = ElevatorDoorState.OPEN;
    this.disembarkPassengers(currentTime);
    this.doorOpenTimer = currentTime + this.config.doorOpenTimeMs;
    this.currentActionFinishTime = this.doorOpenTimer;
    this.passengerActivityEndTime = null;
  }

  // Handles behavior when the doors are OPEN. Checks if it's time to close.
  private handleDoorOpenState(currentTime: number): void {
    if (this.passengerActivityEndTime !== null && currentTime < this.passengerActivityEndTime) {
      this.currentActionFinishTime = this.passengerActivityEndTime;
      return;
    }
    if (this.doorOpenTimer && currentTime >= this.doorOpenTimer) {
      this.setState(ElevatorState.DOOR_CLOSING);
      this.doorState = ElevatorDoorState.CLOSING;
      this.currentActionFinishTime = currentTime + this.config.doorTransitionTimeMs;
      this.doorOpenTimer = undefined;
    } else if (this.doorOpenTimer) {
        this.currentActionFinishTime = Math.max(this.doorOpenTimer, this.passengerActivityEndTime ?? -1);
    }
  }

  // Handles behavior when the doors have finished CLOSING.
  private handleDoorClosingState(currentTime: number): void {
    this.doorState = ElevatorDoorState.CLOSED;
    this.determineNextTarget();
    if (this.targetFloor !== null) {
      if (this.targetFloor === this.currentFloor) {
        this.consumeStopAtCurrentFloor();
        this.setState(ElevatorState.STOPPED_AT_FLOOR);
      } else {
        this.direction = this.targetFloor > this.currentFloor ? ElevatorDirection.UP : ElevatorDirection.DOWN;
        this.setState(this.direction === ElevatorDirection.UP ? ElevatorState.MOVING_UP : ElevatorState.MOVING_DOWN);
        this.currentActionFinishTime = currentTime + this.config.floorTravelTimeMs;
      }
    } else {
      this.setState(ElevatorState.IDLE);
      this.direction = ElevatorDirection.IDLE;
    }
  }

  // Determines the next immediate targetFloor based on SCAN/LOOK principles.
  private determineNextTarget(): void {
    this.targetFloor = null;

    const clearPassedStops = (stops: MinHeap<number>, isUpQueue: boolean) => {
      while (!stops.isEmpty()) {
        const nextStop = stops.peek()!;
        if ((isUpQueue && nextStop < this.currentFloor) || (!isUpQueue && nextStop > this.currentFloor)) { stops.extractMin(); } 
        else { break; }
      }
    };

    let currentDirection = this.direction;

    if (currentDirection === ElevatorDirection.IDLE) {
        clearPassedStops(this.upStops, true); clearPassedStops(this.downStops, false);
        const nextUp = this.upStops.peek(); const nextDown = this.downStops.peek();
        if (nextUp !== undefined && nextDown !== undefined) { currentDirection = Math.abs(nextUp - this.currentFloor) <= Math.abs(nextDown - this.currentFloor) ? ElevatorDirection.UP : ElevatorDirection.DOWN;}
        else if (nextUp !== undefined) { currentDirection = ElevatorDirection.UP; }
        else if (nextDown !== undefined) { currentDirection = ElevatorDirection.DOWN; }
    }

    if (currentDirection === ElevatorDirection.UP) {
      clearPassedStops(this.upStops, true);
      if (!this.upStops.isEmpty()) { this.targetFloor = this.upStops.peek()!; }
      else { clearPassedStops(this.downStops, false); if (!this.downStops.isEmpty()) { this.targetFloor = this.downStops.peek()!; }}
    } else if (currentDirection === ElevatorDirection.DOWN) {
      clearPassedStops(this.downStops, false);
      if (!this.downStops.isEmpty()) { this.targetFloor = this.downStops.peek()!; }
      else { clearPassedStops(this.upStops, true); if (!this.upStops.isEmpty()) { this.targetFloor = this.upStops.peek()!; }}
    }
  }

  // Removes the current floor from the appropriate stop queue after servicing it.
  private consumeStopAtCurrentFloor(): void {
    if (this.upStops.peek() === this.currentFloor) this.upStops.extractMin();
    if (this.downStops.peek() === this.currentFloor) this.downStops.extractMin();
  }

  // Adds a floor to the elevator's stop list.
  public addStop(floor: number): void {
    if (floor === this.currentFloor && (this.state === ElevatorState.DOOR_OPEN || this.state === ElevatorState.DOOR_OPENING || this.state === ElevatorState.STOPPED_AT_FLOOR)) return;

    if (floor > this.currentFloor) {
      if (!this.upStops.find(f => f === floor)) this.upStops.insert(floor);
    } else if (floor < this.currentFloor) {
      if (!this.downStops.find(f => f === floor)) this.downStops.insert(floor);
    } else {
      if (this.direction === ElevatorDirection.DOWN) { if (!this.upStops.find(f => f === floor)) this.upStops.insert(floor); }
      else { if (!this.downStops.find(f => f === floor)) this.downStops.insert(floor); }
    }
  }

  // Handles disembarking of passengers whose destination is the current floor.
  private disembarkPassengers(currentTime: number): void {
    this.passengers = this.passengers.filter(p => {
      if (p.destinationFloor === this.currentFloor) {
        p.status = RequestStatus.COMPLETED;
        p.dropoffTimestamp = currentTime;
        return false;
      }
      return true;
    });
  }

  // Boards a single passenger if capacity allows. Called by ElevatorManager.
  public boardPassenger(passenger: PassengerRequest, currentTime: number): boolean {
    if (this.passengers.length >= this.capacity) {
      passenger.status = RequestStatus.PENDING_ASSIGNMENT;
      return false;
    }
    
    passenger.status = RequestStatus.IN_TRANSIT;
    passenger.pickupTimestamp = currentTime;
    passenger.assignedElevatorId = this.id;
    this.passengers.push(passenger);
    this.addStop(passenger.destinationFloor);
    
    if (this.state === ElevatorState.DOOR_OPEN) {
        const activityStartTime = this.passengerActivityEndTime ?? currentTime;
        this.passengerActivityEndTime = activityStartTime + PASSENGER_ACTIVITY_TIME_MS_PER_PERSON;
        this.currentActionFinishTime = Math.max(this.doorOpenTimer ?? -1, this.passengerActivityEndTime);
    }
    return true;
  }

  // Handles external signal to open doors (e.g., button press).
  public signalOpenDoor(currentTime: number): void {
    if (this.state === ElevatorState.DOOR_OPEN || this.state === ElevatorState.DOOR_OPENING) {
      this.setState(ElevatorState.DOOR_OPEN);
      this.doorState = ElevatorDoorState.OPEN;
      const newDoorOpenEndTime = currentTime + Math.max(this.config.doorOpenTimeMs, DOOR_OPEN_BUTTON_MINIMAL_TIME);
      if (this.doorOpenTimer === undefined || newDoorOpenEndTime > this.doorOpenTimer) this.doorOpenTimer = newDoorOpenEndTime;
      this.currentActionFinishTime = Math.max(this.doorOpenTimer, this.passengerActivityEndTime ?? -1);
    } else if (this.state === ElevatorState.STOPPED_AT_FLOOR || this.state === ElevatorState.DOOR_CLOSING) {
      this.setState(ElevatorState.DOOR_OPENING);
      this.doorState = ElevatorDoorState.OPENING;
      this.currentActionFinishTime = currentTime + this.config.doorTransitionTimeMs;
      this.doorOpenTimer = undefined;
      this.passengerActivityEndTime = null;
    }
  }

  // Handles external signal to close doors (e.g., button press).
  public signalCloseDoor(currentTime: number): void {
    if (this.state === ElevatorState.DOOR_OPEN && this.doorOpenTimer) {
      const activityEndTime = this.passengerActivityEndTime ?? currentTime;
      if (currentTime >= activityEndTime) {
        const expeditedDoorCloseStartTime = currentTime + 100; // Minimal delay.
        if (expeditedDoorCloseStartTime < this.doorOpenTimer) {
          this.doorOpenTimer = expeditedDoorCloseStartTime;
          this.currentActionFinishTime = this.doorOpenTimer;
        }
      }
    }
  }

  // Sets the elevator's state.
  private setState(newState: ElevatorState): void {
    if (this.state !== newState) this.state = newState;
  }

  // Handles emergency stop button press.
  public signalEmergencyStop(): void {
      if (this.state !== ElevatorState.EMERGENCY_STOP) {
          this.setState(ElevatorState.EMERGENCY_STOP);
          this.direction = ElevatorDirection.IDLE;
          this.targetFloor = null;
          this.currentActionFinishTime = null;
          this.doorOpenTimer = undefined;
          this.passengerActivityEndTime = null;
      }
  }

  // Resets from emergency stop.
  public resetEmergencyStop(): void {
      if (this.state === ElevatorState.EMERGENCY_STOP) {
          this.setState(ElevatorState.IDLE);
          this.determineNextTarget(); // Re-evaluate stops.
      }
  }

  // Calculates ETA considering potential future delays heuristically.
  public calculateETA(targetFloorQuery: number, currentTime: number): number {
    let eta = currentTime;
    let simFloor = this.currentFloor;
    let simDirection = this.direction;

    const currentActionEndTime = Math.max(this.currentActionFinishTime ?? -1, this.passengerActivityEndTime ?? -1);
    if (currentActionEndTime > eta) {
      eta = currentActionEndTime;
      if (this.state === ElevatorState.MOVING_UP || this.state === ElevatorState.MOVING_DOWN) {
        simFloor += (this.direction === ElevatorDirection.UP ? 1 : -1);
      }
    }

    if (simFloor === targetFloorQuery) { // If already at target or will be after current action
       // Refined check for initial state at target
       switch (this.state) {
            case ElevatorState.STOPPED_AT_FLOOR:
              eta = Math.max(eta, currentTime); // Current time is baseline
              eta += this.config.doorTransitionTimeMs + this.config.doorOpenTimeMs + this.config.doorTransitionTimeMs; // Full cycle
              eta += (this.passengers.length * PASSENGER_ACTIVITY_TIME_MS_PER_PERSON);
              break;
            case ElevatorState.DOOR_OPENING:
              eta = Math.max(eta, this.currentActionFinishTime ?? eta); // Wait for open
              eta += this.config.doorOpenTimeMs + this.config.doorTransitionTimeMs; // Add open + close
              eta += (this.passengers.length * PASSENGER_ACTIVITY_TIME_MS_PER_PERSON);
              break;
            case ElevatorState.DOOR_OPEN: {
              const remainingOpen = Math.max(0, (this.doorOpenTimer ?? eta) - currentTime);
              const remainingActivity = Math.max(0, (this.passengerActivityEndTime ?? eta) - currentTime);
              eta = currentTime + Math.max(remainingOpen, remainingActivity); // Wait for longer
              eta += this.config.doorTransitionTimeMs; // Add close
              break;
            }
            case ElevatorState.DOOR_CLOSING:
               eta = Math.max(eta, this.currentActionFinishTime ?? eta); // Wait for close
               break;
       }
       return eta;
    }

    const tempUpStops = this.upStops.clone();
    const tempDownStops = this.downStops.clone();
    const estimatedPassengers = this.passengers.length;

    // Heuristic: Calculate base time for a stop cycle.
    const standardStopTime = this.config.doorTransitionTimeMs * 2 + this.config.doorOpenTimeMs + (estimatedPassengers * PASSENGER_ACTIVITY_TIME_MS_PER_PERSON);
    // Heuristic: Penalty per floor passed without stopping.
    const penaltyPerFloorPassed = standardStopTime * POTENTIAL_STOP_PENALTY_FACTOR;

    let addedQueryTarget = false;
    if (targetFloorQuery > simFloor && !tempUpStops.find(f => f === targetFloorQuery)) { tempUpStops.insert(targetFloorQuery); addedQueryTarget = true; }
    else if (targetFloorQuery < simFloor && !tempDownStops.find(f => f === targetFloorQuery)) { tempDownStops.insert(targetFloorQuery); addedQueryTarget = true; }

    let iterations = 0;
    while (simFloor !== targetFloorQuery && iterations < MAX_ETA_SIMULATION_ITERATIONS) {
      iterations++;
      let nextTargetInSim: number | null = null;
      let nextDirectionInSim: ElevatorDirection = simDirection;

      // --- Simulate determineNextTarget ---
      const clearPassedStopsSim = (stops: MinHeap<number>, isUpQueue: boolean) => { while (!stops.isEmpty()) { const ns = stops.peek()!; if ((isUpQueue && ns < simFloor) || (!isUpQueue && ns > simFloor)) stops.extractMin(); else break; } };
      if (nextDirectionInSim === ElevatorDirection.IDLE) { clearPassedStopsSim(tempUpStops, true); clearPassedStopsSim(tempDownStops, false); const nu = tempUpStops.peek(); const nd = tempDownStops.peek(); if (nu !== undefined && nd !== undefined) nextDirectionInSim = Math.abs(nu - simFloor) <= Math.abs(nd - simFloor) ? ElevatorDirection.UP : ElevatorDirection.DOWN; else if (nu !== undefined) nextDirectionInSim = ElevatorDirection.UP; else if (nd !== undefined) nextDirectionInSim = ElevatorDirection.DOWN; }
      if (nextDirectionInSim === ElevatorDirection.UP) { clearPassedStopsSim(tempUpStops, true); if (!tempUpStops.isEmpty()) nextTargetInSim = tempUpStops.peek()!; else { clearPassedStopsSim(tempDownStops, false); if(!tempDownStops.isEmpty()) {nextTargetInSim = tempDownStops.peek()!; nextDirectionInSim = ElevatorDirection.DOWN;} } }
      else if (nextDirectionInSim === ElevatorDirection.DOWN) { clearPassedStopsSim(tempDownStops, false); if (!tempDownStops.isEmpty()) nextTargetInSim = tempDownStops.peek()!; else { clearPassedStopsSim(tempUpStops, true); if(!tempUpStops.isEmpty()) {nextTargetInSim = tempUpStops.peek()!; nextDirectionInSim = ElevatorDirection.UP;} } }
      // --- End Simulate ---

      if (nextTargetInSim === null) {
        if (simFloor === targetFloorQuery) break;
        nextTargetInSim = targetFloorQuery;
        nextDirectionInSim = targetFloorQuery > simFloor ? ElevatorDirection.UP : ElevatorDirection.DOWN;
        break;
      }

      const floorsToTravel = Math.abs(nextTargetInSim - simFloor);
      if (floorsToTravel > 0) {
          // Add penalty for floors passed *before* adding travel time
          const floorsPassed = floorsToTravel - 1;
          if (floorsPassed > 0) {
              eta += floorsPassed * penaltyPerFloorPassed;
          }
          // Add travel time
          eta += floorsToTravel * this.config.floorTravelTimeMs;
          simFloor = nextTargetInSim;
          simDirection = nextDirectionInSim;
      }

      let consumedStop = false;
      if (tempUpStops.peek() === simFloor) { tempUpStops.extractMin(); consumedStop = true; }
      if (tempDownStops.peek() === simFloor) { tempDownStops.extractMin(); consumedStop = true; }
      
      if (consumedStop || simFloor === targetFloorQuery) {
           // Add standard stop time
           eta += standardStopTime;
           // If this was the target added just for the query, no need to consume again.
           if (addedQueryTarget && simFloor === targetFloorQuery) consumedStop = false; // Don't double-consume conceptually
      }
      
      if(simFloor === targetFloorQuery) break;

    } 

    if (iterations >= MAX_ETA_SIMULATION_ITERATIONS) {
        console.warn(`Elevator ${this.id}: ETA calculation exceeded max iterations for target ${targetFloorQuery}. Returning simplified estimate.`);
        let fallbackEta = currentTime;
        const actionEndTimeFallback = Math.max(this.currentActionFinishTime ?? -1, this.passengerActivityEndTime ?? -1);
        if (actionEndTimeFallback > fallbackEta) fallbackEta = actionEndTimeFallback;
        fallbackEta += Math.abs(targetFloorQuery - this.currentFloor) * this.config.floorTravelTimeMs;
        return fallbackEta;
    }

    return Math.max(currentTime, eta);
  }

  // Log informational messages (optional)
  private logInfo(message: string): void {
    console.log(`[Elevator ${this.id} @ F${this.currentFloor} | ${this.state}] ${message}`);
  }

  // Log error messages
  private logError(message: string): void {
    console.error(`[Elevator ${this.id} @ F${this.currentFloor}] ERROR: ${message}`);
  }
}