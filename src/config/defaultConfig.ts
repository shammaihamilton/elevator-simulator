// Default configuration for the elevator system
import { DispatchStrategy } from '../types/enums';
import type { ElevatorSystemConfig } from '../types/interfaces';



// Default configuration with realistic timing values
export const defaultElevatorSystemConfig: ElevatorSystemConfig = {
  numberOfFloors: 10,             
  numberOfElevators: 3,           
  elevatorCapacity: 8,             
  initialFloor: 0,                
  doorOpenTimeMs: 3000,          
  doorTransitionTimeMs: 1500,     
  floorTravelTimeMs: 2000,        
  dispatchStrategy: DispatchStrategy.CLOSEST_CABIN,
  simulationTickMs: 100,          
};
