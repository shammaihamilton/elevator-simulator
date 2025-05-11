// Export all configuration-related types and defaults
export * from './defaultConfig';
import { defaultElevatorSystemConfig } from './defaultConfig';
import type { ElevatorSystemConfig } from '../types/interfaces';

// Configuration utilities and validators
export function validateElevatorSystemConfig(config: Partial<ElevatorSystemConfig>): ElevatorSystemConfig {  const mergedConfig = {
    ...defaultElevatorSystemConfig,
    ...config,
  };

  // Validate numeric values are positive
  if (mergedConfig.doorOpenTimeMs <= 0) throw new Error('doorOpenTimeMs must be positive');
  if (mergedConfig.doorTransitionTimeMs <= 0) throw new Error('doorTransitionTimeMs must be positive');
  if (mergedConfig.floorTravelTimeMs <= 0) throw new Error('floorTravelTimeMs must be positive');
  if (mergedConfig.numberOfFloors <= 0) throw new Error('numberOfFloors must be positive');
  if (mergedConfig.numberOfElevators <= 0) throw new Error('numberOfElevators must be positive');
  if (mergedConfig.elevatorCapacity <= 0) throw new Error('elevatorCapacity must be positive');
  if (mergedConfig.simulationTickMs && mergedConfig.simulationTickMs <= 0) throw new Error('simulationTickMs must be positive');

  // Validate initialFloor is within bounds if specified
  if (mergedConfig.initialFloor !== undefined && 
      (mergedConfig.initialFloor < 0 || mergedConfig.initialFloor >= mergedConfig.numberOfFloors)) {
    throw new Error('initialFloor must be within valid floor range');
  }

  return mergedConfig;
}

