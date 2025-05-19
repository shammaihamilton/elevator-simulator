import { ElevatorManager } from '../core/ElevatorManager';
import { ElevatorFactory } from './ElevatorFactory';
import { ElevatorTimingSettings } from '@/interfaces';

export class ElevatorManagerFactory {
  static create(
    idPrefix: string,
    elevatorConfigs: {
    initialFloor: number;
    timing: ElevatorTimingSettings;
    }[]
  ): ElevatorManager {
    const elevators = elevatorConfigs.map((config, i) =>
      ElevatorFactory.create({
        id: `${idPrefix}-E${i + 1}`,
        ...config
      })
    );
    return new ElevatorManager(elevators);
  }
}
