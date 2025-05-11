// src/core/ElevatorManager.ts
import { MinHeap } from "../data-structures/MinHeap";
import { generateId } from "../utils/idGenerator";
import type {
  Elevator,
  PassengerRequest,
  Button,
  BuildingConfig,
  ElevatorSystem,
} from "../types/interfaces";
import {
  ElevatorDirection,
  ElevatorState,
  ElevatorDoorState, // Added for boardWaitingPassengers
  ButtonState,
  ButtonType,
  GlobalSystemState,
  RequestStatus,
} from "../types/enums";
import { ElevatorFSM } from "./Elevator"; // Corrected import to ElevatorFSM
import { RequestTimingData } from "./RequestTimingData";
import { passengerRequestComparator } from "../utils/comparators";

export class ElevatorManager {
  private systemState: ElevatorSystem;
  private static instance: ElevatorManager | null = null;

  /**
   * Returns the singleton instance of ElevatorManager.
   */
  public static getInstance(): ElevatorManager {
    if (!ElevatorManager.instance) {
      throw new Error("ElevatorManager instance has not been initialized.");
    }
    return ElevatorManager.instance;
  }

  /**
   * Initializes the singleton instance of ElevatorManager.
   */
  public static initializeInstance(config: BuildingConfig): void {
    if (!ElevatorManager.instance) {
      ElevatorManager.instance = new ElevatorManager(config);
    } else {
      throw new Error("ElevatorManager instance is already initialized.");
    }
  }

  /**
   * Resets the singleton instance. Should only be used during cleanup/unmount.
   */
  public static resetInstance(): void {
    ElevatorManager.instance = null;
  }

  constructor(config: BuildingConfig) {
    if (ElevatorManager.instance) {
      throw new Error("ElevatorManager instance already exists. Use getInstance() to access it.");
    }

    const validatedConfig = {
      ...config,
      initialFloor: config.initialFloor ?? 0,
      simulationTickMs: config.simulationTickMs ?? 100,
    };

    if (validatedConfig.numberOfFloors <= 0)
      throw new Error("Number of floors must be positive");
    if (validatedConfig.numberOfElevators <= 0)
      throw new Error("Number of elevators must be positive");
    if (validatedConfig.elevatorCapacity <= 0)
      throw new Error("Elevator capacity must be positive");
    if (
      validatedConfig.initialFloor < 0 ||
      validatedConfig.initialFloor >= validatedConfig.numberOfFloors
    ) {
      throw new Error("Initial floor must be within valid floor range");
    }

    this.systemState = {
      config: validatedConfig,
      elevators: [],
      pendingRequests: new MinHeap<PassengerRequest>(
        passengerRequestComparator
      ),
      buttons: this.initializeButtons(validatedConfig),
      currentTime: 0,
      globalState: GlobalSystemState.NORMAL,
      simulationSpeedFactor: 1,
    };

    ElevatorManager.instance = this;
    this.initializeElevators();
  }

  private initializeElevators(): void {
    const config = this.systemState.config;
    if (config.numberOfElevators <= 0)
      throw new Error("Invalid number of elevators");

    for (let i = 0; i < config.numberOfElevators; i++) {
      const elevatorId = generateId();
      const initialFloor = config.initialFloor ?? 0;

      if (config.doorTransitionTimeMs <= 0)
        throw new Error("Invalid door transition time");
      if (config.doorOpenTimeMs <= 0) throw new Error("Invalid door open time");
      if (config.floorTravelTimeMs <= 0)
        throw new Error("Invalid floor travel time");

      const elevator = new ElevatorFSM(
        elevatorId,
        config.elevatorCapacity,
        initialFloor,
        {
          doorTransitionTimeMs: config.doorTransitionTimeMs,
          doorOpenTimeMs: config.doorOpenTimeMs,
          floorTravelTimeMs: config.floorTravelTimeMs,
        },
        this
      );
      this.systemState.elevators.push(elevator);
    }
  }

  private initializeButtons(config: BuildingConfig): Button[] {
    const buttons: Button[] = [];
    for (let i = 0; i < config.numberOfFloors; i++) {
      if (i < config.numberOfFloors - 1) {
        buttons.push({
          id: `floor-${i}-call-up`,
          type: ButtonType.CALL_UP,
          floorNumber: i,
          state: ButtonState.RELEASED,
        });
      }
      if (i > 0) {
        buttons.push({
          id: `floor-${i}-call-down`,
          type: ButtonType.CALL_DOWN,
          floorNumber: i,
          state: ButtonState.RELEASED,
        });
      }
    }
    return buttons;
  }

  public getSimulationSpeedFactor(): number {
    return this.systemState.simulationSpeedFactor;
  }

  public addPassengerRequestFromFloorCall(
    sourceFloor: number,
    destinationFloor: number,
    requestedDirection: "UP" | "DOWN",
    priority: number = 10
  ): string {
    if (this.systemState.globalState !== GlobalSystemState.NORMAL) {
      console.warn("System not normal, request ignored during floor call.");
      return "";
    }

    const request: PassengerRequest = {
      id: generateId(),
      sourceFloor,
      destinationFloor,
      status: RequestStatus.PENDING_ASSIGNMENT,
      priority,
      timing: new RequestTimingData(this.systemState.currentTime),
    };

    this.systemState.pendingRequests.insert(request);
    console.log(
      `Request ${request.id} added: F${sourceFloor} to F${destinationFloor} (Dir: ${requestedDirection})`
    );

    const buttonId = `floor-${sourceFloor}-call-${requestedDirection.toLowerCase()}`;
    this.updateButtonState(buttonId, ButtonState.PRESSED);

    return request.id;
  }

  public addRequestFromElevatorPanel(
    elevatorId: string,
    destinationFloor: number
  ): void {
    if (this.systemState.globalState !== GlobalSystemState.NORMAL) return;

    const elevator = this.findElevator(elevatorId);
    if (!elevator) {
      console.error(`Elevator ${elevatorId} not found.`);
      return;
    }

    elevator.addStop(destinationFloor);
    console.log(
      `Elevator ${elevatorId} panel: stop added for F${destinationFloor}`
    );
  }

  public tick(): void {
    if (this.systemState.globalState !== GlobalSystemState.NORMAL) {
      this.systemState.elevators.forEach((elevator) => {
        elevator.update(this.systemState.currentTime);
      });
      return;
    }

    this.systemState.currentTime +=
      this.systemState.config.simulationTickMs || 100;

    this.systemState.elevators.forEach((elevator) => {
      elevator.update(this.systemState.currentTime);
    });

    this.boardWaitingPassengers();
    this.assignNewRequestsToElevators();
    this.cleanupCompletedRequests();
  }

  private boardWaitingPassengers(): void {
    const requestsToKeep = new MinHeap<PassengerRequest>(
      passengerRequestComparator
    );

    while (!this.systemState.pendingRequests.isEmpty()) {
      const request = this.systemState.pendingRequests.extractMin()!;

      if (
        request.status === RequestStatus.WAITING_FOR_PICKUP &&
        request.assignedElevatorId
      ) {
        const elevator = this.findElevator(request.assignedElevatorId);

        if (
          elevator &&
          elevator.currentFloor === request.sourceFloor &&
          (elevator.doorState === ElevatorDoorState.OPEN ||
            elevator.doorState === ElevatorDoorState.OPENING)
        ) {
          console.log(
            `Elevator ${elevator.id} at F${request.sourceFloor} (for request ${request.id}). Attempting to board.`
          );
          const boarded = elevator.boardPassenger(
            request,
            this.systemState.currentTime
          );

          if (boarded) {
            console.log(
              `Passenger for request ${request.id} (F${request.sourceFloor} to F${request.destinationFloor}) boarded elevator ${elevator.id}. Request status now IN_TRANSIT.`
            );

            const callDirection =
              request.destinationFloor > request.sourceFloor
                ? ElevatorDirection.UP
                : ElevatorDirection.DOWN;
            const buttonId = `floor-${
              request.sourceFloor
            }-call-${callDirection.toLowerCase()}`;

            let otherActiveCallsForThisButton = false;
            const allPotentiallyActiveRequests = requestsToKeep
              .toArray()
              .concat(this.systemState.pendingRequests.toArray());
            // Also consider the current request if it wasn't the one being processed for this button state check
            // However, since we are processing *this* request, we check others.

            for (const otherReq of allPotentiallyActiveRequests) {
              if (
                otherReq.id !== request.id && // Don't check against itself
                otherReq.sourceFloor === request.sourceFloor &&
                (otherReq.destinationFloor > otherReq.sourceFloor
                  ? ElevatorDirection.UP
                  : ElevatorDirection.DOWN) === callDirection &&
                (otherReq.status === RequestStatus.PENDING_ASSIGNMENT ||
                  otherReq.status === RequestStatus.WAITING_FOR_PICKUP)
              ) {
                otherActiveCallsForThisButton = true;
                break;
              }
            }
            // Check the current request again if its status didn't change to IN_TRANSIT (though boardPassenger should do that)
            // This logic might need further refinement for complex multi-call scenarios for the same button.
            // Let's simplify: if *this* request was just boarded, assume its call is serviced *for now*.
            if (!otherActiveCallsForThisButton) {
              this.updateButtonState(buttonId, ButtonState.RELEASED);
              console.log(`Button ${buttonId} released.`);
            } else {
              console.log(
                `Button ${buttonId} not released, other calls still pending for this floor/direction.`
              );
            }
          } else {
            console.log(
              `Elevator ${elevator.id} is full or cannot board passenger for request ${request.id} at F${request.sourceFloor}. Request remains WAITING_FOR_PICKUP.`
            );
          }
        }
      }
      requestsToKeep.insert(request); // Always re-add; status might have changed or it's for cleanup
    }
    this.systemState.pendingRequests = requestsToKeep;
  }

  private assignNewRequestsToElevators(): void {
    const requestsToKeep = new MinHeap<PassengerRequest>(
      passengerRequestComparator
    );
    const requestsThatWerePendingAssignment: PassengerRequest[] = [];

    while (!this.systemState.pendingRequests.isEmpty()) {
      const request = this.systemState.pendingRequests.extractMin()!;
      if (request.status === RequestStatus.PENDING_ASSIGNMENT) {
        requestsThatWerePendingAssignment.push(request);
      } else {
        requestsToKeep.insert(request);
      }
    }

    requestsThatWerePendingAssignment.forEach((request) => {
      const bestElevator = this.findBestElevatorForRequest(request);
      if (bestElevator) {
        request.status = RequestStatus.WAITING_FOR_PICKUP;
        request.assignedElevatorId = bestElevator.id;
        request.timing.markAssigned(this.systemState.currentTime);
        bestElevator.addStop(request.sourceFloor);
        console.log(
          `Request ${request.id} (F${request.sourceFloor}) assigned to elevator ${bestElevator.id}. Status now WAITING_FOR_PICKUP.`
        );
      } else {
        console.log(
          `No suitable elevator found for request ${request.id} (F${request.sourceFloor}). Remains PENDING_ASSIGNMENT.`
        );
      }
      requestsToKeep.insert(request);
    });

    this.systemState.pendingRequests = requestsToKeep;
  }

  private cleanupCompletedRequests(): void {
    const activeRequests = new MinHeap<PassengerRequest>(
      passengerRequestComparator
    );
    while (!this.systemState.pendingRequests.isEmpty()) {
      const request = this.systemState.pendingRequests.extractMin()!;
      if (request.status !== RequestStatus.COMPLETED) {
        activeRequests.insert(request);
      } else {
        console.log(
          `Request ${request.id} (F${request.sourceFloor} to F${request.destinationFloor}) is COMPLETED and removed from manager's queue.`
        );
      }
    }
    this.systemState.pendingRequests = activeRequests;
  }

  private findBestElevatorForRequest(
    request: PassengerRequest
  ): Elevator | null {
    let bestElevator: Elevator | null = null;
    let bestScore = Infinity;

    this.systemState.elevators.forEach((elevator) => {
      const score = this.calculateElevatorScore(elevator, request);
      if (score < bestScore) {
        bestScore = score;
        bestElevator = elevator;
      }
    });
    return bestElevator;
  }

  private calculateElevatorScore(
    elevator: Elevator,
    request: PassengerRequest
  ): number {
    if (!this.isElevatorAvailable(elevator)) {
      return Infinity;
    }

    let score = Math.abs(elevator.currentFloor - request.sourceFloor) * 100;

    if (elevator.direction !== ElevatorDirection.IDLE) {
      const requestDirection =
        request.destinationFloor > request.sourceFloor
          ? ElevatorDirection.UP
          : ElevatorDirection.DOWN;

      if (elevator.direction === requestDirection) {
        if (
          (elevator.direction === ElevatorDirection.UP &&
            elevator.currentFloor <= request.sourceFloor) ||
          (elevator.direction === ElevatorDirection.DOWN &&
            elevator.currentFloor >= request.sourceFloor)
        ) {
          score *= 0.5;
        } else {
          score *= 3;
        }
      } else {
        score *= 4;
      }
    }

    const loadFactor = elevator.passengers.length / elevator.capacity;
    score *= 1 + loadFactor;

    if (elevator.state === ElevatorState.IDLE) {
      score *= 0.9;
    }
    return score;
  }

  private isElevatorAvailable(elevator: Elevator): boolean {
    return (
      elevator.state !== ElevatorState.MAINTENANCE &&
      elevator.state !== ElevatorState.OUT_OF_SERVICE &&
      elevator.state !== ElevatorState.EMERGENCY_STOP &&
      elevator.state !== ElevatorState.OVERLOADED
    ); // Assuming OVERLOADED is a state
  }

  private findElevator(elevatorId: string): Elevator | undefined {
    return this.systemState.elevators.find((e) => e.id === elevatorId);
  }

  private updateButtonState(buttonId: string, newState: ButtonState): void {
    const button = this.systemState.buttons.find((b) => b.id === buttonId);
    if (button) {
      button.state = newState;
    }
  }

  public getSystemState(): ElevatorSystem {
    return this.systemState;
  }

  public setSimulationSpeed(factor: number): void {
    if (factor <= 0) {
      console.warn("Simulation speed factor must be positive");
      return;
    }
    this.systemState.simulationSpeedFactor = factor;
  }

  public triggerEmergency(type: GlobalSystemState): void {
    this.systemState.globalState = type;
  }

  public resetEmergency(): void {
    this.systemState.globalState = GlobalSystemState.NORMAL;
  }

  /**
   * Marks a request as fulfilled and removes it from the pending queue.
   * @param elevatorId The ID of the elevator that fulfilled the request.
   * @param floor The floor where the request was fulfilled.
   */
  public markRequestAsFulfilled(elevatorId: string, floor: number): void {
    const activeRequests = new MinHeap<PassengerRequest>(passengerRequestComparator);

    while (!this.systemState.pendingRequests.isEmpty()) {
        const request = this.systemState.pendingRequests.extractMin()!;
        if (
            request.assignedElevatorId === elevatorId &&
            request.sourceFloor === floor &&
            request.status === RequestStatus.IN_TRANSIT
        ) {
            console.log(`Request ${request.id} fulfilled by elevator ${elevatorId} at floor ${floor}.`);
            request.status = RequestStatus.COMPLETED;
        } else {
            activeRequests.insert(request);
        }
    }

    this.systemState.pendingRequests = activeRequests;
  }

  /**
   * Cleanup method to be called when the simulation is stopped.
   */
  public cleanup(): void {
    // Reset all elevators
    this.systemState.elevators.forEach(elevator => {
      if ('reset' in elevator) {
        (elevator as any).reset(this.systemState.config.initialFloor);
      }
    });
    // Clear pending requests
    this.systemState.pendingRequests = new MinHeap<PassengerRequest>(passengerRequestComparator);
    // Reset buttons
    this.systemState.buttons.forEach(button => {
      button.state = ButtonState.RELEASED;
    });
    // Reset time and state
    this.systemState.currentTime = 0;
    this.systemState.globalState = GlobalSystemState.NORMAL;
    this.systemState.simulationSpeedFactor = 1;
  }
}
