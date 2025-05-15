import { PassengerRequest, IRequestTimingData } from '../types/interfaces';
import { buildingsSettings } from '../config/buildingSettings';
import { generateId } from '../utils/idGenerator';
import { RequestTimingData } from '../core/RequestTimingData';
import { RequestStatus } from '../types/enums';

export class ElevatorRequestFactory {
  static create(sourceFloor: number, destinationFloor: number): PassengerRequest {
    const floorDiff = Math.abs(sourceFloor - destinationFloor);
    const estimatedServiceTimeMs =
      floorDiff * buildingsSettings.timing.floorTravelTimeMs + buildingsSettings.timing.delayPerFloorMs;

    const id = generateId(`request: {sourceFloor:${sourceFloor}, destinationFloor: ${destinationFloor}}`);
    const requestedAt: IRequestTimingData = new RequestTimingData(Date.now());

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


