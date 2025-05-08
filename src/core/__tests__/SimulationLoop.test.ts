import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SimulationLoop } from '../SimulationLoop';
import { GlobalSystemState, DispatchStrategy } from '../../types/enums';

describe('SimulationLoop', () => {
  let simulationLoop: SimulationLoop;
  const mockConfig = {
    numberOfFloors: 10,
    numberOfElevators: 2,
    elevatorCapacity: 8,
    doorOpenTimeMs: 3000,
    doorTransitionTimeMs: 1500,
    floorTravelTimeMs: 2000,
    dispatchStrategy: DispatchStrategy.CLOSEST_CABIN,
    simulationTickMs: 100
  };

  beforeEach(() => {
    // Mock performance.now() for consistent testing
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    // Mock cancelAnimationFrame
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id);
    });
    
    simulationLoop = new SimulationLoop(mockConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should create a simulation with correct initial state', () => {
      const state = simulationLoop.getSystemState();
      expect(state.config).toEqual(mockConfig);
      expect(state.elevators).toHaveLength(mockConfig.numberOfElevators);
      expect(state.globalState).toBe(GlobalSystemState.NORMAL);
      expect(state.simulationSpeedFactor).toBe(1);
    });
  });

  describe('Simulation Control', () => {
    it('should start and stop simulation correctly', () => {
      simulationLoop.start();
      expect(window.requestAnimationFrame).toHaveBeenCalled();
      
      simulationLoop.stop();
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should handle multiple start calls gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      simulationLoop.start();
      simulationLoop.start(); // Second call
      
      expect(consoleSpy).toHaveBeenCalledWith('Simulation is already running');
      expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    });

    it('should pause and resume simulation', () => {
      simulationLoop.start();
      simulationLoop.pause();
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
      
      simulationLoop.resume();
      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should adjust simulation speed correctly', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      simulationLoop.setSimulationSpeed(2);
      expect(simulationLoop.getSystemState().simulationSpeedFactor).toBe(2);
      
      simulationLoop.setSimulationSpeed(0);
      expect(consoleSpy).toHaveBeenCalledWith('Simulation speed factor must be positive');
      expect(simulationLoop.getSystemState().simulationSpeedFactor).toBe(2);
    });
  });

  describe('Emergency Handling', () => {
    it('should handle emergency states correctly', () => {
      simulationLoop.triggerEmergency(GlobalSystemState.FIRE_ALARM);
      expect(simulationLoop.getSystemState().globalState).toBe(GlobalSystemState.FIRE_ALARM);
      
      simulationLoop.resetEmergency();
      expect(simulationLoop.getSystemState().globalState).toBe(GlobalSystemState.NORMAL);
    });
  });

  describe('Request Handling', () => {
    it('should handle passenger requests correctly', () => {
      const requestId = simulationLoop.addPassengerRequest(1, 5, "UP");
      expect(requestId).toBeTruthy();
      
      const state = simulationLoop.getSystemState();
      expect(state.pendingRequests.size).toBe(1);
    });

    it('should handle elevator panel requests correctly', () => {
      const state = simulationLoop.getSystemState();
      const elevatorId = state.elevators[0].id;
      
      simulationLoop.addElevatorPanelRequest(elevatorId, 5);
      expect(state.elevators[0].upStops.size).toBe(1);
    });

    it('should handle invalid elevator panel requests gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      
      simulationLoop.addElevatorPanelRequest('invalid-id', 5);
      expect(consoleSpy).toHaveBeenCalledWith('Elevator invalid-id not found.');
    });
  });

  describe('Time Management', () => {
    it('should accumulate time correctly', async () => {
      vi.useFakeTimers();
      const initialTime = simulationLoop.getSystemState().currentTime;
      
      simulationLoop.start();
      await vi.advanceTimersByTimeAsync(1000); // Advance by 1 second
      
      const newTime = simulationLoop.getSystemState().currentTime;
      expect(newTime).toBeGreaterThan(initialTime);
      
      vi.useRealTimers();
    });

    it('should respect simulation speed factor', async () => {
      vi.useFakeTimers();
      const initialTime = simulationLoop.getSystemState().currentTime;
      
      simulationLoop.setSimulationSpeed(2); // Double speed
      simulationLoop.start();
      await vi.advanceTimersByTimeAsync(1000);
      
      const timeWithDoubleSpeed = simulationLoop.getSystemState().currentTime;
      
      simulationLoop.stop();
      simulationLoop.setSimulationSpeed(1);
      simulationLoop.start();
      await vi.advanceTimersByTimeAsync(1000);
      
      const timeWithNormalSpeed = simulationLoop.getSystemState().currentTime;
      
      expect(timeWithDoubleSpeed - initialTime).toBeGreaterThan(
        timeWithNormalSpeed - timeWithDoubleSpeed
      );
      
      vi.useRealTimers();
    });
  });

  describe('Cleanup', () => {
    it('should perform cleanup correctly', () => {
      simulationLoop.start();
      simulationLoop.cleanup();
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });
  });
});