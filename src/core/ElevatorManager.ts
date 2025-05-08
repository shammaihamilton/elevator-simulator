import { MinHeap } from '../data-structures/MinHeap';
import { isMovingDirection } from '../utils/elevatorDirectionUtils';
import { generateId } from '../utils/idGenerator';
import type { 
  Elevator, 
  PassengerRequest, 
  Button,
  BuildingConfig,
  ElevatorSystem 
} from '../types/interfaces';
import {
  ElevatorDirection,
  ElevatorState,
  ElevatorDoorState,
  ButtonState,
  ButtonType,
  GlobalSystemState,
  RequestStatus
} from '../types/enums';

export class ElevatorManager {
  public systemState: ElevatorSystem;
  private lastTickTimestamp: number = 0;

  constructor(config: BuildingConfig) {
    this.systemState = {
      config,
      elevators: [],
      pendingRequests: new MinHeap<PassengerRequest>(
        (a, b) => { // Prioritize by priority, then by timestamp
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return a.requestTimestamp - b.requestTimestamp;
        }
      ),
      buttons: this.initializeButtons(config), // Basic button initialization
      currentTime: 0, // Simulation ticks
      globalState: GlobalSystemState.NORMAL,
      simulationSpeedFactor: 1,
    };
    this.initializeElevators();
    this.lastTickTimestamp = Date.now();
  }

  private initializeElevators(): void {
    for (let i = 0; i < this.systemState.config.numberOfElevators; i++) {
      const elevatorId = generateId();
      this.systemState.elevators.push({
        id: elevatorId,
        currentFloor: 0, // Assuming ground floor is 0
        direction: ElevatorDirection.IDLE,
        state: ElevatorState.IDLE,
        doorState: ElevatorDoorState.CLOSED,
        passengers: [],
        upStops: new MinHeap<number>((a, b) => a - b),
        downStops: new MinHeap<number>((a, b) => b - a), // Acts as MaxHeap for floors
        targetFloor: null,
        capacity: this.systemState.config.elevatorCapacity,
        doorOpenTimer: 0,
      });
    }
  }

  private initializeButtons(config: BuildingConfig): Button[] {
    const buttons: Button[] = [];
    // Floor call buttons
    for (let i = 0; i < config.numberOfFloors; i++) {
      if (i < config.numberOfFloors - 1) { // No UP button on top floor
        buttons.push({ id: `floor-${i}-call-up`, type: ButtonType.CALL_UP, floorNumber: i, state: ButtonState.RELEASED });
      }
      if (i > 0) { // No DOWN button on ground floor
        buttons.push({ id: `floor-${i}-call-down`, type: ButtonType.CALL_DOWN, floorNumber: i, state: ButtonState.RELEASED });
      }
    }
    // Elevator internal buttons (could be done when elevators are initialized or per elevator)
    // For simplicity, not adding all internal buttons here yet.
    return buttons;
  }

  // --- Public API Methods ---

  /**
   * Creates a passenger request when a floor button is pressed.
   * For simplicity, this version assumes destination is known immediately.
   * A more realistic model might queue a FloorCall, and destination is set upon boarding.
   */
  public addPassengerRequestFromFloorCall(
    sourceFloor: number,
    destinationFloor: number,
    requestedDirection: "UP" | "DOWN",
    priority: number = 10
  ): string {
    if (this.systemState.globalState !== GlobalSystemState.NORMAL) {
        console.warn("System not normal, request ignored.");
        return "";
    }
    const request: PassengerRequest = {
      id: generateId(),
      sourceFloor,
      destinationFloor,
      requestTimestamp: this.systemState.currentTime,
      status: RequestStatus.PENDING_ASSIGNMENT,
      priority,
    };
    this.systemState.pendingRequests.insert(request);
    console.log(`Request ${request.id} added: F${sourceFloor} to F${destinationFloor}`);
    const buttonId = `floor-${sourceFloor}-call-${requestedDirection.toLowerCase()}`;
    this.updateButtonState(buttonId, ButtonState.PRESSED);

    return request.id;
  }

  /**
   * Creates a passenger request from inside an elevator.
   */
  public addRequestFromElevatorPanel(elevatorId: string, destinationFloor: number): void {
    if (this.systemState.globalState !== GlobalSystemState.NORMAL) return;

    const elevator = this.findElevator(elevatorId);
    if (!elevator) {
      console.error(`Elevator ${elevatorId} not found.`);
      return;
    }

    this.addStopToElevator(elevator, destinationFloor);
    console.log(`Elevator ${elevatorId} panel: stop added for F${destinationFloor}`);
  }

  /**
   * Main simulation loop. Should be called repeatedly (e.g., via setInterval).
   */
  public tick(): void {
    if (this.systemState.globalState !== GlobalSystemState.NORMAL &&
        this.systemState.globalState !== GlobalSystemState.FIRE_ALARM /* etc. handle special modes */) {
        // In some non-normal states, simulation might be paused or elevators behave differently
        return;
    }

    this.systemState.currentTime++; // Increment simulation tick

    this.updateElevatorsState();
    this.dispatchPendingRequests();
  }

  // --- Core Logic Methods ---

  private updateElevatorsState(): void {
    this.systemState.elevators.forEach(elevator => {
      this.processElevatorLogic(elevator);
    });
  }

  private processElevatorLogic(elevator: Elevator): void {
    // Reduce door timer if active
    if (elevator.doorOpenTimer && elevator.doorOpenTimer > 0) {
      elevator.doorOpenTimer--;
    }

    switch (elevator.state) {
      case ElevatorState.IDLE:
        this.handleIdleElevator(elevator);
        break;
      case ElevatorState.MOVING_UP:
      case ElevatorState.MOVING_DOWN:
        this.handleMovingElevator(elevator);
        break;
      case ElevatorState.STOPPED_AT_FLOOR:
        // This state implies we've decided to stop; transition to opening doors
        elevator.state = ElevatorState.DOOR_OPENING;
        elevator.doorState = ElevatorDoorState.OPENING;
        elevator.doorOpenTimer = this.msToTicks(this.systemState.config.doorTransitionTimeMs);
        break;
      case ElevatorState.DOOR_OPENING:
        if (elevator.doorOpenTimer === 0) {
          elevator.state = ElevatorState.DOOR_OPEN;
          elevator.doorState = ElevatorDoorState.OPEN;
          elevator.doorOpenTimer = this.msToTicks(this.systemState.config.doorOpenTimeMs);
          this.handlePassengerExchange(elevator); // Exchange passengers once doors are fully open
        }
        break;
      case ElevatorState.DOOR_OPEN:
        if (elevator.doorOpenTimer === 0) {
          elevator.state = ElevatorState.DOOR_CLOSING;
          elevator.doorState = ElevatorDoorState.CLOSING;
          elevator.doorOpenTimer = this.msToTicks(this.systemState.config.doorTransitionTimeMs);
        }
        break;
      case ElevatorState.DOOR_CLOSING:
        if (elevator.doorOpenTimer === 0) {
          elevator.doorState = ElevatorDoorState.CLOSED;
          this.determineNextMoveForElevator(elevator); // Decide what to do after doors close
        }
        break;
      // Other states like MAINTENANCE, OVERLOADED, EMERGENCY_STOP need specific handling
    }
  }

  private handleIdleElevator(elevator: Elevator): void {
    // If idle, try to find a target from its own queues first
    this.determineNextMoveForElevator(elevator);
    // If still idle, it will wait for dispatching logic to assign a task
  }

  private handleMovingElevator(elevator: Elevator): void {
    if (elevator.targetFloor === null) {
      this.determineNextMoveForElevator(elevator);
      return;
    }

    if (elevator.direction === ElevatorDirection.UP) {
        elevator.currentFloor++;
    } else if (elevator.direction === ElevatorDirection.DOWN) {
        elevator.currentFloor--;
    }

    if (elevator.currentFloor === elevator.targetFloor) {
        elevator.state = ElevatorState.STOPPED_AT_FLOOR;
        // Consume the stop from the queue
        if (elevator.direction === ElevatorDirection.UP) {
          if (elevator.upStops.peek() === elevator.currentFloor) elevator.upStops.extractMin();
        } else if (elevator.direction === ElevatorDirection.DOWN) {
          if (elevator.downStops.peek() === elevator.currentFloor) elevator.downStops.extractMin();
        }
        // Clear call button if this stop serviced it
        this.clearCallButtonForFloor(elevator.currentFloor, elevator.direction);
    }
  }

  private handlePassengerExchange(elevator: Elevator): void {
    // Disembark passengers
    elevator.passengers = elevator.passengers.filter(p => {
      if (p.destinationFloor === elevator.currentFloor) {
        console.log(`Passenger ${p.id} disembarked at F${elevator.currentFloor} from Elv ${elevator.id}`);
        p.status = RequestStatus.COMPLETED;
        p.dropoffTimestamp = this.systemState.currentTime;
        return false; // Remove from elevator
      }
      return true;
    });

    // Board passengers
    const requestsToBoard: PassengerRequest[] = [];
    const tempPendingRequests = new MinHeap<PassengerRequest>(
      (a, b) => { 
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.requestTimestamp - b.requestTimestamp;
      }
    );
    
    while(!this.systemState.pendingRequests.isEmpty()) {
        const req = this.systemState.pendingRequests.extractMin()!;
        if (
            req.sourceFloor === elevator.currentFloor &&
            req.assignedElevatorId === elevator.id &&
            elevator.passengers.length < elevator.capacity &&
            ( (isMovingDirection(elevator.direction) && this.requestMatchesDirection(req, elevator.direction)) || elevator.direction === ElevatorDirection.IDLE)
        ) {
            requestsToBoard.push(req);
        } else {
            tempPendingRequests.insert(req);
        }
    }
    this.systemState.pendingRequests = tempPendingRequests;

    requestsToBoard.forEach(req => {
        if (elevator.passengers.length < elevator.capacity) {
            req.status = RequestStatus.IN_TRANSIT;
            req.pickupTimestamp = this.systemState.currentTime;
            elevator.passengers.push(req);
            this.addStopToElevator(elevator, req.destinationFloor);
            console.log(`Passenger ${req.id} boarded Elv ${elevator.id} at F${elevator.currentFloor} to F${req.destinationFloor}`);
            this.clearCallButtonForFloor(req.sourceFloor, this.getDirectionFromRequest(req));
        } else {
            console.log(`Elevator ${elevator.id} full, request ${req.id} cannot board.`);
            req.assignedElevatorId = undefined;
            req.status = RequestStatus.PENDING_ASSIGNMENT;
            this.systemState.pendingRequests.insert(req);
        }
    });
  }

  /**
   * Decides the next target floor and state for an elevator, typically after doors close or when idle.
   */
  private determineNextMoveForElevator(elevator: Elevator): void {
    let nextTarget: number | undefined = undefined;

    if (elevator.direction === ElevatorDirection.UP && !elevator.upStops.isEmpty()) {
      nextTarget = elevator.upStops.peek();
    } else if (elevator.direction === ElevatorDirection.DOWN && !elevator.downStops.isEmpty()) {
      nextTarget = elevator.downStops.peek();
    } else {
      if (!elevator.upStops.isEmpty()) {
        nextTarget = elevator.upStops.peek();
        elevator.direction = ElevatorDirection.UP;
      }
      else if (!elevator.downStops.isEmpty()) {
        nextTarget = elevator.downStops.peek();
        elevator.direction = ElevatorDirection.DOWN;
      }
    }

    if (nextTarget !== undefined) {
      elevator.targetFloor = nextTarget;
      if (elevator.currentFloor === elevator.targetFloor) {
         elevator.state = ElevatorState.STOPPED_AT_FLOOR;
      } else {
         elevator.state = elevator.direction === ElevatorDirection.UP ? 
           ElevatorState.MOVING_UP : 
           ElevatorState.MOVING_DOWN;
      }
    } else {
      elevator.state = ElevatorState.IDLE;
      elevator.direction = ElevatorDirection.IDLE;
      elevator.targetFloor = null;
    }
  }

  private dispatchPendingRequests(): void {
    if (this.systemState.pendingRequests.isEmpty()) return;

    const request = this.systemState.pendingRequests.peek(); // Look at highest priority
    if (!request || request.assignedElevatorId) return; // Already assigned or no request

    let bestElevator: Elevator | null = null;

    for (const elevator of this.systemState.elevators) {
      if (elevator.state === ElevatorState.IDLE) {
        bestElevator = elevator;
        break;
      }
    }

    if (bestElevator) {
      const assignedRequest = this.systemState.pendingRequests.extractMin()!;
      assignedRequest.assignedElevatorId = bestElevator.id;
      assignedRequest.status = RequestStatus.WAITING_FOR_PICKUP;
      this.addStopToElevator(bestElevator, assignedRequest.sourceFloor);

      console.log(`Request ${assignedRequest.id} dispatched to Elevator ${bestElevator.id}`);

      if (bestElevator.state === ElevatorState.IDLE) {
        this.determineNextMoveForElevator(bestElevator);
      }
    }
  }

  /**
   * Helper to add a stop to the correct queue in an elevator.
   */
  private addStopToElevator(elevator: Elevator, floor: number): void {
    if (elevator.direction === ElevatorDirection.UP) {
      if (floor >= elevator.currentFloor) {
        if (elevator.upStops.peek() !== floor || elevator.upStops.toArray().indexOf(floor) === -1) elevator.upStops.insert(floor);
      } else {
        if (elevator.downStops.peek() !== floor || elevator.downStops.toArray().indexOf(floor) === -1) elevator.downStops.insert(floor);
      }
    } else if (elevator.direction === ElevatorDirection.DOWN) {
      if (floor <= elevator.currentFloor) {
         if (elevator.downStops.peek() !== floor || elevator.downStops.toArray().indexOf(floor) === -1) elevator.downStops.insert(floor);
      } else {
         if (elevator.upStops.peek() !== floor || elevator.upStops.toArray().indexOf(floor) === -1) elevator.upStops.insert(floor);
      }
    } else {
      if (floor > elevator.currentFloor) {
        if (elevator.upStops.peek() !== floor || elevator.upStops.toArray().indexOf(floor) === -1) elevator.upStops.insert(floor);
      } else if (floor < elevator.currentFloor) {
        if (elevator.downStops.peek() !== floor || elevator.downStops.toArray().indexOf(floor) === -1) elevator.downStops.insert(floor);
      } else {
        if (elevator.upStops.peek() !== floor || elevator.upStops.toArray().indexOf(floor) === -1) elevator.upStops.insert(floor);
      }
    }
  }

  // --- Utility Methods ---
  private findElevator(elevatorId: string): Elevator | undefined {
    return this.systemState.elevators.find(e => e.id === elevatorId);
  }

  private msToTicks(ms: number): number {
    const tickDuration = this.systemState.config.simulationTickMs || 100; // Default tick to 100ms
    return Math.max(1, Math.round(ms / tickDuration)); // Ensure at least 1 tick
  }

  private updateButtonState(buttonId: string, newState: ButtonState): void {
    const button = this.systemState.buttons.find(b => b.id === buttonId);
    if (button) {
        button.state = newState;
    }
  }
  private clearCallButtonForFloor(floor: number, direction: ElevatorDirection): void {
    if (!isMovingDirection(direction)) return; // Only UP/DOWN calls
    const buttonId = `floor-${floor}-call-${direction.toLowerCase()}`;
    this.updateButtonState(buttonId, ButtonState.RELEASED);
  }
  private getDirectionFromRequest(request: PassengerRequest): ElevatorDirection {
      if (request.destinationFloor > request.sourceFloor) return ElevatorDirection.UP;
      if (request.destinationFloor < request.sourceFloor) return ElevatorDirection.DOWN;
      return ElevatorDirection.IDLE; // Should not happen for a valid move
  }
  private requestMatchesDirection(request: PassengerRequest, elevatorDirection: "UP" | "DOWN"): boolean {
      const requestDirection = this.getDirectionFromRequest(request);
      return requestDirection === elevatorDirection;
  }
}