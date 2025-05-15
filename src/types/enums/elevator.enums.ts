
export const ElevatorState = {
    IDLE: 'IDLE',
    MOVING_UP: 'MOVING_UP',
    MOVING_DOWN: 'MOVING_DOWN',
    STOPPED_AT_FLOOR: 'STOPPED_AT_FLOOR',
    DOOR_OPENING: 'DOOR_OPENING',
    DOOR_OPEN: 'DOOR_OPEN',
    DOOR_CLOSED: 'DOOR_CLOSED',
  } as const;
  export type ElevatorState = typeof ElevatorState[keyof typeof ElevatorState];
  
  
  export const ElevatorDoorState = {
    OPEN: "OPEN",
    CLOSED: "CLOSED",
    OPENING: "OPENING",
    CLOSING: "CLOSING"
  } as const;
  export type ElevatorDoorState = typeof ElevatorDoorState[keyof typeof ElevatorDoorState];
  
