import { RequestStatus } from "@/types/enums";


export interface FloorStatus {
  requestStatus: RequestStatus;
  etaSeconds: number | null;
  isElevatorServicing: boolean;
}