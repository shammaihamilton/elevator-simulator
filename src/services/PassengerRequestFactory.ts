import { PassengerRequest, IRequestTimingData } from '@/interfaces';
import { defaultAppSettings } from '../config/defaultConfig';
import { generateId } from '../utils/idGenerator';
import { RequestTimingData } from '../core/RequestTimingData';
import { RequestStatus } from '../types/enums';

export class ElevatorRequestFactory {
  static create(sourceFloor: number, destinationFloor: number, currentTime: number): PassengerRequest {
    const floorDiff = Math.abs(sourceFloor - destinationFloor);
    const estimatedServiceTimeMs =
      floorDiff * defaultAppSettings.timing.floorTravelTimeMs + defaultAppSettings.timing.delayPerFloorMs;

    const id = generateId(`request: {sourceFloor:${sourceFloor}, destinationFloor: ${destinationFloor}}`);
    const requestedAt: IRequestTimingData = new RequestTimingData(currentTime);

    const request: PassengerRequest = {
      id,
      pickedUp: false,
      requestedAt,
      status: RequestStatus.PENDING_ASSIGNMENT,
      sourceFloor,
      destinationFloor,
      estimatedServiceTimeMs,
    };

    return request;


  }
}


