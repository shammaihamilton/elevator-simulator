import type { ElevatorSystem, BuildingConfig } from '../types/interfaces';
import { ElevatorManager } from './ElevatorManager';
import { GlobalSystemState } from '../types/enums';

export class SimulationLoop {
  private manager: ElevatorManager;
  private intervalId: number | null = null;
  private lastTickTime: number = 0;
  private accumulatedTime: number = 0;

  constructor(config: BuildingConfig) {
    this.manager = new ElevatorManager(config);
  }

  public start(): void {
    if (this.intervalId !== null) {
      console.warn('Simulation is already running');
      return;
    }

    this.lastTickTime = performance.now();
    
    // Using requestAnimationFrame for smoother simulation
    const tick = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTickTime;
      this.lastTickTime = currentTime;

      // Accumulate time and run simulation ticks based on config.simulationTickMs
      this.accumulatedTime += deltaTime * this.manager.systemState.simulationSpeedFactor;
      const tickMs = this.manager.systemState.config.simulationTickMs || 100;

      while (this.accumulatedTime >= tickMs) {
        this.manager.tick();
        this.accumulatedTime -= tickMs;
      }

      // Continue animation loop unless stopped
      if (this.intervalId !== null) {
        this.intervalId = requestAnimationFrame(tick);
      }
    };

    this.intervalId = requestAnimationFrame(tick);
  }

  public stop(): void {
    if (this.intervalId !== null) {
      cancelAnimationFrame(this.intervalId);
      this.intervalId = null;
    }
  }

  public pause(): void {
    this.stop();
  }

  public resume(): void {
    this.start();
  }

  public setSimulationSpeed(factor: number): void {
    if (factor <= 0) {
      console.warn('Simulation speed factor must be positive');
      return;
    }
    this.manager.systemState.simulationSpeedFactor = factor;
  }

  public getSystemState(): ElevatorSystem {
    return this.manager.systemState;
  }

  public triggerEmergency(type: GlobalSystemState): void {
    this.manager.systemState.globalState = type;
    // Additional emergency handling could be added here
  }

  public resetEmergency(): void {
    this.manager.systemState.globalState = GlobalSystemState.NORMAL;
  }

  // Methods for external control of the elevator system
  public addPassengerRequest(
    sourceFloor: number, 
    destinationFloor: number, 
    requestedDirection: "UP" | "DOWN", 
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
    this.stop();
    // Add any additional cleanup needed
  }
}