// src/core/ElevatorFSM.ts
// Manages the state and behavior of a single elevator using a Finite State Machine (FSM).

import { ElevatorState, ElevatorDirection, ElevatorDoorState, RequestStatus } from '../types/enums';
import type { Elevator, PassengerRequest, BuildingConfig, IElevatorTimingManager } from '../types/interfaces';
import { ElevatorTimingManager } from './ElevatorTimingManager';
import { MinHeap } from '../data-structures/MinHeap';
import { ascNumberComparator, descNumberComparator } from '../utils/comparators';
import { ElevatorManager } from './ElevatorManager';

const PASSENGER_ACTIVITY_TIME_MS_PER_PERSON = 500; // Time per passenger for boarding/alighting
const DOOR_OPEN_BUTTON_MINIMAL_TIME = 1000; // Minimal time door stays open/reopens on button press
const MAX_ETA_SIMULATION_ITERATIONS = 100; // Safety limit for ETA calculation loops
// const POTENTIAL_STOP_PENALTY_FACTOR = 0.08; // Factor for penalizing potential stops in ETA

export class ElevatorFSM implements Elevator {
  id: string;
  currentFloor: number = 0;
  direction: ElevatorDirection = ElevatorDirection.IDLE;
  state: ElevatorState = ElevatorState.IDLE;
  doorState: ElevatorDoorState = ElevatorDoorState.CLOSED;
  passengers: PassengerRequest[] = [];
  upStops: MinHeap<number>;
  downStops: MinHeap<number>;
  targetFloor: number | null = null;
  capacity: number;
  timing: IElevatorTimingManager;

  private config: Pick<BuildingConfig, 'doorTransitionTimeMs' | 'doorOpenTimeMs' | 'floorTravelTimeMs'>;
  private manager: ElevatorManager;
  
  constructor(
    id: string,
    capacity: number,
    initialFloor: number = 1,
    timingConfig: Pick<BuildingConfig, 'doorTransitionTimeMs' | 'doorOpenTimeMs' | 'floorTravelTimeMs'>,
    manager: ElevatorManager
  ) {
    this.id = id;
    this.capacity = capacity;
    this.currentFloor = initialFloor;
    this.config = timingConfig;
    this.manager = manager;
    this.upStops = new MinHeap<number>(ascNumberComparator);
    this.downStops = new MinHeap<number>(descNumberComparator);
    this.targetFloor = null;
    this.timing = new ElevatorTimingManager();
  }

  /**
   * Main update method called each simulation tick to drive the FSM.
   * @param currentTime The current simulation time in milliseconds.
   */
  public update(currentTime: number): void {
    if (this.state === ElevatorState.MAINTENANCE || this.state === ElevatorState.OUT_OF_SERVICE) return;
    
    if (this.timing.getActionFinishTime() !== null && currentTime >= this.timing.getActionFinishTime()!) {
      this.timing.setActionFinishTime(null); 
    }
    
    switch (this.state) {
      case ElevatorState.IDLE: this.handleIdleState(currentTime); break;
      case ElevatorState.MOVING_UP:
      case ElevatorState.MOVING_DOWN: this.handleMovingState(currentTime); break;
      case ElevatorState.STOPPED_AT_FLOOR: this.handleStoppedAtFloorState(currentTime); break;
      case ElevatorState.DOOR_OPENING: this.handleDoorOpeningState(currentTime); break;
      case ElevatorState.DOOR_OPEN: this.handleDoorOpenState(currentTime); break;
      case ElevatorState.DOOR_CLOSING: this.handleDoorClosingState(currentTime); break;
      case ElevatorState.EMERGENCY_STOP:
         // In EMERGENCY_STOP, no automatic actions proceed.
         break;
      default: this.logError(`Unknown state ${this.state}`);
    }
  }

  private handleIdleState(currentTime: number): void {
    this.determineNextTarget();
    if (this.targetFloor !== null) {
      if (this.targetFloor === this.currentFloor) {
        this.consumeStopAtCurrentFloor(); 
        this.setState(ElevatorState.STOPPED_AT_FLOOR); // Will transition to DOOR_OPENING
      } else {
        this.direction = this.targetFloor > this.currentFloor ? ElevatorDirection.UP : ElevatorDirection.DOWN;
        this.setState(this.direction === ElevatorDirection.UP ? ElevatorState.MOVING_UP : ElevatorState.MOVING_DOWN);
        this.timing.setActionFinishTime(currentTime + this.config.floorTravelTimeMs);
      }
    }
  }

  // Called when one floor travel is complete (actionFinishTime met).
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
               this.timing.setActionFinishTime(currentTime + this.config.floorTravelTimeMs);
           } else {
               // No further target, or target is current floor (which should have been caught by shouldStop)
               this.setState(ElevatorState.IDLE);
               this.direction = ElevatorDirection.IDLE;
           }
      } else if (this.targetFloor !== null) {
          this.timing.setActionFinishTime(currentTime + this.config.floorTravelTimeMs);
      } else {
          this.setState(ElevatorState.IDLE);
          this.direction = ElevatorDirection.IDLE;
      }
    }
  }

  private shouldStopAtCurrentFloor(): boolean {
    // Check hall calls in current/potential direction
    if (this.direction === ElevatorDirection.UP || this.direction === ElevatorDirection.IDLE) {
        if (this.upStops.peek() === this.currentFloor) return true;
    }
    if (this.direction === ElevatorDirection.DOWN || this.direction === ElevatorDirection.IDLE) {
        if (this.downStops.peek() === this.currentFloor) return true;
    }
    // Always stop for passenger destinations
    return this.passengers.some(p => p.destinationFloor === this.currentFloor);
  }

  private handleStoppedAtFloorState(currentTime: number): void {
    this.setState(ElevatorState.DOOR_OPENING);
    this.doorState = ElevatorDoorState.OPENING;
    this.timing.setActionFinishTime(currentTime + this.config.doorTransitionTimeMs);
    this.targetFloor = null; // Clear segment target; next target determined after doors close.
  }

  // Called when door opening transition is complete.
  private handleDoorOpeningState(currentTime: number): void {
    this.setState(ElevatorState.DOOR_OPEN);
    this.doorState = ElevatorDoorState.OPEN;
    
    this.disembarkPassengers(currentTime); // Passengers get off first
    
    this.timing.setDoorOpenEndTime(currentTime + this.config.doorOpenTimeMs);
    this.timing.setPassengerActivityEndTime(null); // Will be updated if passengers board/alight
    this.timing.setActionFinishTime(this.timing.getDoorOpenEndTime());
  }

  private handleDoorOpenState(currentTime: number): void {
    const passengerActivityEndTime = this.timing.getPassengerActivityEndTime();
    if (passengerActivityEndTime !== null && currentTime < passengerActivityEndTime) {
      // Passenger activity ongoing, ensure action finish time respects it.
      this.timing.setActionFinishTime(Math.max(
        this.timing.getDoorOpenEndTime() ?? -1, 
        passengerActivityEndTime
      ));
      return; 
    }
    
    if (this.timing.isDoorOpenTimeElapsed(currentTime)) {
      this.setState(ElevatorState.DOOR_CLOSING);
      this.doorState = ElevatorDoorState.CLOSING;
      this.timing.setActionFinishTime(currentTime + this.config.doorTransitionTimeMs);
      this.timing.clearDoorOpenTimer(); 
      this.timing.setPassengerActivityEndTime(null); 
    } else {
      // Door open, but base time not yet elapsed. Ensure action finish time is set.
      this.timing.setActionFinishTime(Math.max(
        this.timing.getDoorOpenEndTime()!, 
        this.timing.getPassengerActivityEndTime() ?? -1
      ));
    }
  }

  // Called when door closing transition is complete.
  private handleDoorClosingState(currentTime: number): void {
    this.doorState = ElevatorDoorState.CLOSED;
    this.determineNextTarget(); 

    if (this.targetFloor !== null) {
      if (this.targetFloor === this.currentFloor) {
        // New request for current floor while doors were closing, or determined as closest.
        this.consumeStopAtCurrentFloor();
        this.setState(ElevatorState.STOPPED_AT_FLOOR); // Re-stop and open doors.
      } else {
        this.direction = this.targetFloor > this.currentFloor ? ElevatorDirection.UP : ElevatorDirection.DOWN;
        this.setState(this.direction === ElevatorDirection.UP ? ElevatorState.MOVING_UP : ElevatorState.MOVING_DOWN);
        this.timing.setActionFinishTime(currentTime + this.config.floorTravelTimeMs);
      }
    } else {
      this.setState(ElevatorState.IDLE);
      this.direction = ElevatorDirection.IDLE;
    }
  }

  // Determines the next immediate targetFloor based on SCAN/LOOK principles.
  private determineNextTarget(): void {
    this.targetFloor = null;

    const clearPassedStops = (stops: MinHeap<number>, isUpQueue: boolean, referenceFloor: number) => {
      while (!stops.isEmpty()) {
        const nextStop = stops.peek()!;
        if ((isUpQueue && nextStop < referenceFloor) || (!isUpQueue && nextStop > referenceFloor)) {
          stops.extractMin();
        } else {
          break;
        }
      }
    };
    
    let newDirection = this.direction;

    if (newDirection === ElevatorDirection.IDLE) {
        // If idle, determine direction based on closest request.
        const nextUp = this.upStops.peek();
        const nextDown = this.downStops.peek();

        if (nextUp !== undefined && nextDown !== undefined) {
            newDirection = Math.abs(nextUp - this.currentFloor) <= Math.abs(nextDown - this.currentFloor) ? ElevatorDirection.UP : ElevatorDirection.DOWN;
        } else if (nextUp !== undefined) {
            newDirection = ElevatorDirection.UP;
        } else if (nextDown !== undefined) {
            newDirection = ElevatorDirection.DOWN;
        } else {
            this.targetFloor = null; // No stops in any direction.
            this.direction = ElevatorDirection.IDLE;
            return;
        }
    }

    if (newDirection === ElevatorDirection.UP) {
      clearPassedStops(this.upStops, true, this.currentFloor);
      if (!this.upStops.isEmpty()) {
        this.targetFloor = this.upStops.peek()!;
        this.direction = ElevatorDirection.UP;
      } else { // No more up stops, check for down stops (turnaround).
        clearPassedStops(this.downStops, false, this.currentFloor);
        if (!this.downStops.isEmpty()) {
          this.targetFloor = this.downStops.peek()!;
          this.direction = ElevatorDirection.DOWN;
        } else {
          this.direction = ElevatorDirection.IDLE; // No stops anywhere
        }
      }
    } else if (newDirection === ElevatorDirection.DOWN) {
      clearPassedStops(this.downStops, false, this.currentFloor);
      if (!this.downStops.isEmpty()) {
        this.targetFloor = this.downStops.peek()!;
        this.direction = ElevatorDirection.DOWN;
      } else { // No more down stops, check for up stops (turnaround).
        clearPassedStops(this.upStops, true, this.currentFloor);
        if (!this.upStops.isEmpty()) {
          this.targetFloor = this.upStops.peek()!;
          this.direction = ElevatorDirection.UP;
        } else {
          this.direction = ElevatorDirection.IDLE;
        }
      }
    }
  }

  private consumeStopAtCurrentFloor(): void {
    if (this.upStops.peek() === this.currentFloor) {
        this.upStops.extractMin();
        this.notifyRequestFulfilled(this.currentFloor);
    }
    if (this.downStops.peek() === this.currentFloor) {
        this.downStops.extractMin();
        this.notifyRequestFulfilled(this.currentFloor);
    }
  }

  /**
   * Notifies the ElevatorManager that a request for the given floor has been fulfilled.
   * @param floor The floor where the request was fulfilled.
   */
  private notifyRequestFulfilled(floor: number): void {
    this.manager.markRequestAsFulfilled(this.id, floor);
  }

  /**
   * Adds a floor to the elevator's stop list.
   * @param floor The floor number to add as a stop.
   */
  public addStop(floor: number): void {
    if (floor === this.currentFloor && 
        (this.state === ElevatorState.DOOR_OPEN || 
         this.state === ElevatorState.DOOR_OPENING || 
         this.state === ElevatorState.STOPPED_AT_FLOOR)) {
      return; // Already servicing or about to service this floor.
    }

    if (floor > this.currentFloor) {
      if (!this.upStops.find(f => f === floor)) this.upStops.insert(floor);
    } else if (floor < this.currentFloor) {
      if (!this.downStops.find(f => f === floor)) this.downStops.insert(floor);
    } else { // floor === this.currentFloor, but not in an open/opening/stopped state
      // Heuristic: Add to the queue corresponding to current/likely direction from this floor.
      if (this.direction === ElevatorDirection.DOWN) { 
        if (!this.downStops.find(f => f === floor)) this.downStops.insert(floor);
      } else { // UP or IDLE (default to adding as an up-stop or continuing-up stop)
        if (!this.upStops.find(f => f === floor)) this.upStops.insert(floor);
      }
    }
  }

  private disembarkPassengers(currentTime: number): void {
    const initialPassengerCount = this.passengers.length;
    this.passengers = this.passengers.filter(p => {
      if (p.destinationFloor === this.currentFloor) {
        p.status = RequestStatus.COMPLETED;
        p.timing.markDroppedOff(currentTime);
        return false; 
      }
      return true;
    });
    const disembarkedCount = initialPassengerCount - this.passengers.length;
    if (disembarkedCount > 0 && this.state === ElevatorState.DOOR_OPEN) {
        const activityEndTime = this.timing.getPassengerActivityEndTime() ?? currentTime;
        this.timing.setPassengerActivityEndTime(activityEndTime + disembarkedCount * PASSENGER_ACTIVITY_TIME_MS_PER_PERSON);
        this.timing.setActionFinishTime(Math.max( // Ensure ActionFinishTime respects this
            this.timing.getDoorOpenEndTime() ?? -1,
            this.timing.getPassengerActivityEndTime()!
        ));
    }
  }

  /**
   * Boards a single passenger if capacity allows.
   * @param passenger The passenger request to board.
   * @param currentTime The current simulation time.
   * @returns True if the passenger was boarded, false otherwise.
   */
  public boardPassenger(passenger: PassengerRequest, currentTime: number): boolean {
    if (this.passengers.length >= this.capacity) {
      if (passenger.status === RequestStatus.IN_TRANSIT) {
          passenger.status = RequestStatus.PENDING_ASSIGNMENT; 
      }
      return false;
    }
    
    passenger.status = RequestStatus.IN_TRANSIT;
    passenger.timing.markPickedUp(currentTime);
    passenger.assignedElevatorId = this.id;
    this.passengers.push(passenger);
    this.addStop(passenger.destinationFloor); 
    
    if (this.state === ElevatorState.DOOR_OPEN) {
      const activityStartTime = this.timing.getPassengerActivityEndTime() ?? currentTime;
      this.timing.setPassengerActivityEndTime(activityStartTime + PASSENGER_ACTIVITY_TIME_MS_PER_PERSON);
      this.timing.setActionFinishTime(Math.max(
        this.timing.getDoorOpenEndTime() ?? -1, 
        this.timing.getPassengerActivityEndTime()!
      ));
    }
    return true;
  }

  /**
   * Handles external signal to open doors (e.g., door open button press).
   * @param currentTime The current simulation time.
   */
  public signalOpenDoor(currentTime: number): void {
    if (this.state === ElevatorState.DOOR_OPEN || this.state === ElevatorState.DOOR_OPENING) {
      this.setState(ElevatorState.DOOR_OPEN); 
      this.doorState = ElevatorDoorState.OPEN;
      this.timing.extendDoorOpenTime(currentTime, DOOR_OPEN_BUTTON_MINIMAL_TIME);
      this.timing.setActionFinishTime(Math.max(
        this.timing.getDoorOpenEndTime()!, 
        this.timing.getPassengerActivityEndTime() ?? -1
      ));
    } else if (this.state === ElevatorState.STOPPED_AT_FLOOR || this.state === ElevatorState.DOOR_CLOSING) {
      this.setState(ElevatorState.DOOR_OPENING);
      this.doorState = ElevatorDoorState.OPENING;
      this.timing.setActionFinishTime(currentTime + this.config.doorTransitionTimeMs);
      this.timing.clearDoorOpenTimer(); // Reset for a new open cycle
      this.timing.setPassengerActivityEndTime(null);
    }
    // Ignored if MOVING or IDLE not at a floor; dispatcher would handle such calls.
  }

  /**
   * Handles external signal to close doors (e.g., door close button press).
   * @param currentTime The current simulation time.
   */
  public signalCloseDoor(currentTime: number): void {
    if (this.state === ElevatorState.DOOR_OPEN && this.timing.getDoorOpenEndTime()) {
      const passengerActivityEndTime = this.timing.getPassengerActivityEndTime() ?? currentTime;
      
      // Allow closing if passenger activity is complete or after minimal open time.
      if (currentTime >= passengerActivityEndTime) {
        const expeditedDoorCloseStartTime = currentTime + 100; // Small delay
        if (expeditedDoorCloseStartTime < this.timing.getDoorOpenEndTime()!) {
          this.timing.setDoorOpenEndTime(expeditedDoorCloseStartTime);
          this.timing.setActionFinishTime(this.timing.getDoorOpenEndTime());
        }
      }
    }
  }

  private setState(newState: ElevatorState): void {
    if (this.state !== newState) {
        this.state = newState;
    }
  }

  /**
   * Activates emergency stop mode.
   */
  public signalEmergencyStop(): void {
      if (this.state !== ElevatorState.EMERGENCY_STOP && this.state !== ElevatorState.OUT_OF_SERVICE && this.state !== ElevatorState.MAINTENANCE) {
          this.setState(ElevatorState.EMERGENCY_STOP);
          this.direction = ElevatorDirection.IDLE; 
          this.targetFloor = null; 
          this.upStops.clear(); 
          this.downStops.clear();
          this.timing.reset(); 
          this.doorState = ElevatorDoorState.CLOSED; // Assumed behavior for simulation
      }
  }

  /**
   * Resets the elevator from emergency stop mode.
   */
  public resetEmergencyStop(): void {
      if (this.state === ElevatorState.EMERGENCY_STOP) {
          this.setState(ElevatorState.IDLE); 
          this.passengers.forEach(p => this.addStop(p.destinationFloor)); // Re-queue passenger destinations
          this.determineNextTarget(); 
      }
  }

  /**
   * Calculates an Estimated Time of Arrival (ETA) to a target floor.
   * This is a heuristic calculation considering current state, stops, and travel times.
   * @param targetFloorQuery The floor for which to calculate ETA.
   * @param currentTime The current simulation time.
   * @returns Estimated arrival time in milliseconds, or Infinity if unreachable.
   */
  public calculateETA(targetFloorQuery: number, currentTime: number): number {
    let eta = currentTime;
    let simFloor = this.currentFloor;
    let simDirection = this.direction;
    const simState = this.state;

    const tempUpStops = this.upStops.clone();
    const tempDownStops = this.downStops.clone();
    
    // Add query floor to simulation stops if not already present
    if (targetFloorQuery > simFloor && !tempUpStops.find(f => f === targetFloorQuery)) { tempUpStops.insert(targetFloorQuery); }
    else if (targetFloorQuery < simFloor && !tempDownStops.find(f => f === targetFloorQuery)) { tempDownStops.insert(targetFloorQuery); }
    else if (targetFloorQuery === simFloor && simState !== ElevatorState.DOOR_OPEN && simState !== ElevatorState.DOOR_OPENING) {
        if (simDirection === ElevatorDirection.DOWN) {
             if (!tempDownStops.find(f => f === targetFloorQuery)) tempDownStops.insert(targetFloorQuery);
        } else {
             if (!tempUpStops.find(f => f === targetFloorQuery)) tempUpStops.insert(targetFloorQuery);
        }
    }

    // 1. Account for current action's/activity's remaining time
    const currentActionFinishTime = this.timing.getActionFinishTime();
    const passengerActivityEndTime = this.timing.getPassengerActivityEndTime();
    let maxPendingTime = -1;

    if (currentActionFinishTime !== null && currentActionFinishTime > currentTime) {
        maxPendingTime = Math.max(maxPendingTime, currentActionFinishTime);
    }
    if (passengerActivityEndTime !== null && passengerActivityEndTime > currentTime) {
        maxPendingTime = Math.max(maxPendingTime, passengerActivityEndTime);
    }
    
    if (maxPendingTime > currentTime) {
        eta = maxPendingTime; // ETA starts from when current activities complete
        if ((simState === ElevatorState.MOVING_UP || simState === ElevatorState.MOVING_DOWN) &&
            this.timing.getActionFinishTime() === currentActionFinishTime) {
            simFloor += (this.direction === ElevatorDirection.UP ? 1 : -1); // Advance simFloor if mid-move
        }
    }
    
    // 2. If query is for current/next floor based on current state
    if (simFloor === targetFloorQuery) {
        switch (simState) {
            case ElevatorState.IDLE: 
            case ElevatorState.STOPPED_AT_FLOOR: // About to open doors
                eta = Math.max(eta, currentTime);
                eta += this.config.doorTransitionTimeMs + this.config.doorOpenTimeMs; // Opening + Open
                break;
            case ElevatorState.DOOR_OPENING: // Waiting for doors to fully open
                eta += this.config.doorOpenTimeMs;
                break;
            case ElevatorState.DOOR_OPEN: // Doors are already open
                // eta already reflects when door open/activity finishes. No additional time for arrival.
                break;
            case ElevatorState.DOOR_CLOSING: // Doors closing, need to re-open
                eta += this.config.doorTransitionTimeMs + this.config.doorOpenTimeMs; // Re-opening + Open
                break;
            case ElevatorState.MOVING_UP: 
            case ElevatorState.MOVING_DOWN: // Arriving at targetFloor after this move
                 if (simFloor === targetFloorQuery) { 
                    eta = Math.max(eta, currentTime);
                    eta += this.config.doorTransitionTimeMs + this.config.doorOpenTimeMs; // Opening + Open
                 }
                break;
        }
        return eta;
    }

    // 3. Simulate future travel and stops
    const standardStopTime = this.config.doorTransitionTimeMs * 2 + this.config.doorOpenTimeMs + 
                             (1 * PASSENGER_ACTIVITY_TIME_MS_PER_PERSON); // Simplified: one person activity per stop
    // const penaltyPerFloorPassed = standardStopTime * POTENTIAL_STOP_PENALTY_FACTOR; // Optional penalty

    let iterations = 0;
    while (simFloor !== targetFloorQuery && iterations < MAX_ETA_SIMULATION_ITERATIONS) {
        iterations++;
        let nextSimTarget: number | null = null;

        // Simulate determineNextTarget
        if (simDirection === ElevatorDirection.IDLE) { /* ... determine initial simDirection ... */ }
        // ... (condensed simulation of determineNextTarget logic as in previous full version) ...
        if (simDirection === ElevatorDirection.IDLE) {
            const nextUp = tempUpStops.peek(); const nextDown = tempDownStops.peek();
            if (nextUp !== undefined && nextDown !== undefined) simDirection = Math.abs(nextUp - simFloor) <= Math.abs(nextDown - simFloor) ? ElevatorDirection.UP : ElevatorDirection.DOWN;
            else if (nextUp !== undefined) simDirection = ElevatorDirection.UP; else if (nextDown !== undefined) simDirection = ElevatorDirection.DOWN; else break;
        }
        if (simDirection === ElevatorDirection.UP) {
            while(!tempUpStops.isEmpty() && tempUpStops.peek()! < simFloor) tempUpStops.extractMin();
            if (!tempUpStops.isEmpty()) nextSimTarget = tempUpStops.peek()!;
            else { simDirection = ElevatorDirection.DOWN; /* check down stops */ }
        }
        if (simDirection === ElevatorDirection.DOWN) { // May be entered after UP turnaround
            while(!tempDownStops.isEmpty() && tempDownStops.peek()! > simFloor) tempDownStops.extractMin();
            if (!tempDownStops.isEmpty()) nextSimTarget = tempDownStops.peek()!;
            else { simDirection = ElevatorDirection.UP; /* check up stops if down was tried */ 
                 if (nextSimTarget === null) { // ensure to check upStops if direction just flipped
                    while(!tempUpStops.isEmpty() && tempUpStops.peek()! < simFloor) tempUpStops.extractMin();
                    if (!tempUpStops.isEmpty()) nextSimTarget = tempUpStops.peek()!; else break;
                 }
            }
        }
        if (nextSimTarget === null) break; 

        const floorsToTravel = Math.abs(nextSimTarget - simFloor);
        eta += floorsToTravel * this.config.floorTravelTimeMs;
        // eta += floorsToTravel * penaltyPerFloorPassed; 
        simFloor = nextSimTarget;

        if (simFloor === targetFloorQuery) { // Arrived at final destination
            eta += this.config.doorTransitionTimeMs + this.config.doorOpenTimeMs; // Door open cycle
            break; 
        }

        eta += standardStopTime; // Time for an intermediate stop

        if (simDirection === ElevatorDirection.UP && tempUpStops.peek() === simFloor) tempUpStops.extractMin();
        else if (simDirection === ElevatorDirection.DOWN && tempDownStops.peek() === simFloor) tempDownStops.extractMin();
    }

    if (iterations >= MAX_ETA_SIMULATION_ITERATIONS) {
        this.logError(`ETA calculation exceeded max iterations for target ${targetFloorQuery}.`);
        return Infinity; 
    }
    return eta;
  }

  /**
   * Places the elevator in maintenance mode.
   * @param enable True to enable maintenance, false to disable.
   */
  public setMaintenance(enable: boolean): void {
    if (enable) {
      if (this.state !== ElevatorState.MAINTENANCE) {
        this.setState(ElevatorState.MAINTENANCE);
        this.direction = ElevatorDirection.IDLE;
        this.targetFloor = null;
        this.passengers = []; // Evacuate passengers
        this.upStops.clear();
        this.downStops.clear();
        this.timing.reset();
      }
    } else {
      if (this.state === ElevatorState.MAINTENANCE) {
        this.setState(ElevatorState.IDLE); // Awaits new calls or update cycle
      }
    }
  }

  /**
   * Sets the elevator as out of service.
   * @param enable True to set out of service, false to disable.
   */
  public setOutOfService(enable: boolean): void {
    if (enable) {
      if (this.state !== ElevatorState.OUT_OF_SERVICE) {
        this.setState(ElevatorState.OUT_OF_SERVICE);
        this.direction = ElevatorDirection.IDLE;
        this.targetFloor = null;
        this.upStops.clear();
        this.downStops.clear();
        this.timing.reset();
      }
    } else {
      if (this.state === ElevatorState.OUT_OF_SERVICE) {
        this.setState(ElevatorState.IDLE);
      }
    }
  }

  /**
   * Returns the current load factor of the elevator (0.0 - 1.0).
   */
  public getLoadFactor(): number {
    return this.capacity === 0 ? 1.0 : this.passengers.length / this.capacity; // Avoid division by zero
  }

  private logError(message: string): void {
    console.error(`[Elevator ${this.id} FSM]: ${message}`);
  }

  /**
   * Resets the elevator to its initial state.
   * @param initialFloor The floor to reset the elevator to.
   */
  public reset(initialFloor: number = 1): void {
    this.currentFloor = initialFloor;
    this.direction = ElevatorDirection.IDLE;
    this.state = ElevatorState.IDLE;
    this.doorState = ElevatorDoorState.CLOSED;
    this.passengers = [];
    this.upStops.clear(); 
    this.downStops.clear(); 
    this.targetFloor = null;
    this.timing.reset();
  }
}