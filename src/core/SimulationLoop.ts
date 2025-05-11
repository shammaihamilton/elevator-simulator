// src/core/SimulationLoop.ts
import type { ElevatorSystemConfig, ElevatorSystem } from '../types/interfaces';
import { ElevatorManager } from './ElevatorManager';
import { GlobalSystemState } from '../types/enums';
import { MinHeap } from '../data-structures/MinHeap';
import { passengerRequestComparator } from '../utils/comparators';

export class SimulationLoop {
  private static instance: SimulationLoop | null = null;
  private manager: ElevatorManager;
  private animationFrameId: number | null = null;
  private lastTickTimestamp: number = 0;
  private accumulatedTime: number = 0;
  private _isRunning: boolean = false;
  private _simulationSpeedFactor: number = 1;


  public static getInstance(config: ElevatorSystemConfig): SimulationLoop {
    if (!SimulationLoop.instance) {
      SimulationLoop.instance = new SimulationLoop(config);
    }
    return SimulationLoop.instance;
  }

  public static resetInstance(): void {
    if (SimulationLoop.instance) {
      SimulationLoop.instance.cleanup();
      SimulationLoop.instance = null;
    }
  }

  private constructor(config: ElevatorSystemConfig) {
    try {
      ElevatorManager.initializeInstance(config);
      this.manager = ElevatorManager.getInstance();
    } catch (error) {
      // If instance already exists, just get the existing instance
      if (error instanceof Error && error.message.includes('already initialized')) {
        this.manager = ElevatorManager.getInstance();
      } else {
        throw error;
      }
    }
  }

  public start(): void {
    if (this._isRunning) {
      console.warn('Simulation is already running.');
      return;
    }
    try {
      this._isRunning = true;
      this.lastTickTimestamp = performance.now();
      this.accumulatedTime = 0; // Reset accumulated time
      console.log('Simulation loop started.');
      this.loop();
    } catch (error) {
      console.error('Error starting simulation:', error);
      this._isRunning = false;
    }
  }

  private loop = (timestamp: number = performance.now()): void => {
    if (!this._isRunning) {
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      return;
    }

    const deltaTime = timestamp - this.lastTickTimestamp;
    this.lastTickTimestamp = timestamp;

    this.accumulatedTime += deltaTime * this._simulationSpeedFactor;
    const tickMs = this.manager.getSystemState().config.simulationTickMs ?? 100; // Default to 100ms if undefined
    const systemState = this.manager.getSystemState();

    while (this.accumulatedTime >= tickMs) {
      if (!this._isRunning) break;

      if (systemState.globalState !== GlobalSystemState.NORMAL) {
        // In emergency states, slow down the simulation
        this.accumulatedTime -= tickMs * 2;
      } else {
        this.accumulatedTime -= tickMs;
      }

      this.tick(); // Always tick to allow emergency protocols to execute
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private tick(): void {
    try {
      this.manager.tick();
    } catch (error) {
      console.error('Error in simulation tick:', error);
      this._isRunning = false;
    }
  }

  public stop(): void {
    this._isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('Simulation loop stopped.');
  }

  public pause(): void {
    this._isRunning = false; // The loop will stop processing ticks
    console.log('Simulation loop paused.');
    // Note: requestAnimationFrame might still be queued for one last call,
    // but the _isRunning flag will prevent tick processing.
  }

  public resume(): void {
    if (!this._isRunning) {
      this._isRunning = true;
      this.lastTickTimestamp = performance.now(); // Reset timestamp to avoid large jump
      // accumulatedTime remains, so it picks up where it left off if it was mid-tick interval
      if (this.animationFrameId === null) { // If it was fully stopped, restart RAF loop
        console.log('Simulation loop resumed.');
        this.loop();
      } else {
        console.log('Simulation loop resumed (RAF was likely still pending).');
      }
    }
  }

  public get isRunning(): boolean {
    return this._isRunning;
  }

  public setSimulationSpeed(factor: number): void {
    if (factor <= 0) {
      console.warn('Simulation speed factor must be positive.');
      return;
    }
    this._simulationSpeedFactor = factor;
    this.manager.setSimulationSpeed(factor); // Also update manager's internal factor if it uses it
    console.log(`Simulation speed set to: ${factor}x`);
  }

  public getSystemState(): ElevatorSystem {
    try {
      return this.manager.getSystemState();
    } catch (error) {
      console.error('Error getting system state:', error);
      // Return a safe default state
      return {
        config: this.manager.getSystemState().config,
        elevators: [],
        pendingRequests: new MinHeap<any>(passengerRequestComparator),
        buttons: [],
        currentTime: 0,
        globalState: GlobalSystemState.NORMAL,
        simulationSpeedFactor: 1
      };
    }
  }

  public triggerEmergency(type: GlobalSystemState): void {
    this.manager.triggerEmergency(type);
    // If global state affects loop itself (e.g. full stop)
    if (type === GlobalSystemState.EMERGENCY_STOP_ALL) {
      this.pause(); // Example: pause the loop on critical emergency
    }
    console.log(`Emergency triggered in simulation loop: ${type}`);
  }

  public resetEmergency(): void {
    this.manager.resetEmergency();
    // this.resume(); // Optionally resume if emergency stop paused it
    console.log('Emergency reset in simulation loop.');
  }

  public addPassengerRequest(
    sourceFloor: number,
    destinationFloor: number,
    requestedDirection: "UP" | "DOWN", // Keep this as ElevatorManager expects it
    priority: number = 10
  ): string {
    return this.manager.addPassengerRequestFromFloorCall(
      sourceFloor,
      destinationFloor,
      requestedDirection,
      priority
    );
  }

  public addElevatorPanelRequest(elevatorId: string, destinationFloor: number): void {
    this.manager.addRequestFromElevatorPanel(elevatorId, destinationFloor);
  }

  public cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this._isRunning = false;
    this.manager.cleanup();
    ElevatorManager.resetInstance();
  }
}