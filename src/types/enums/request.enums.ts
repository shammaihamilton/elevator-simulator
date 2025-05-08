export const RequestStatus = {
    PENDING_ASSIGNMENT: "PENDING_ASSIGNMENT",
    WAITING_FOR_PICKUP: "WAITING_FOR_PICKUP",
    IN_TRANSIT: "IN_TRANSIT",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED"
  } as const;
  export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];
  
  export const DispatchStrategy = {
    CLOSEST_CABIN: "CLOSEST_CABIN",
    LEAST_STOPS: "LEAST_STOPS"
  } as const;
  export type DispatchStrategy = typeof DispatchStrategy[keyof typeof DispatchStrategy];
  