import { RequestStatus } from "../types/enums";
import { IRequestTimingData } from "./requestTimingData.interface";

export interface PassengerRequest {
  id: string;
  status: RequestStatus;
  sourceFloor: number;
  destinationFloor: number;
  assignedElevatorId?: string;
  estimatedServiceTimeMs?: number;
  pickedUp?: boolean;
  requestedAt: IRequestTimingData;
}