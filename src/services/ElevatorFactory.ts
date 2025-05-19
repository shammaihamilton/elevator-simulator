import { ElevatorFSM } from '../core/ElevatorFSM';
import { ElevatorTimingSettings } from '@/interfaces';

export class ElevatorFactory {
  static create(config: {
    id: string;
    initialFloor: number;
    timing: ElevatorTimingSettings;
  }): ElevatorFSM {
    return new ElevatorFSM(config.id, config.initialFloor, config.timing); // You can store `capacity` later
  }
}
