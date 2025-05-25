

export const RequestStatus = {
    PENDING_ASSIGNMENT: "PENDING_ASSIGNMENT",
    WAITING_FOR_PICKUP: "WAITING_FOR_PICKUP",
    IN_TRANSIT: "IN_TRANSIT",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    ELEVATOR_PASSING: "ELEVATOR_PASSING",
  } as const;
  export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];