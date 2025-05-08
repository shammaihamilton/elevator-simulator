export const ElevatorState = {
    IDLE: 'IDLE',
    MOVING_UP: 'MOVING_UP',
    MOVING_DOWN: 'MOVING_DOWN',
    STOPPED_AT_FLOOR: 'STOPPED_AT_FLOOR',
    DOOR_OPENING: 'DOOR_OPENING',
    DOOR_OPEN: 'DOOR_OPEN',
    DOOR_CLOSING: 'DOOR_CLOSING',
    MAINTENANCE: 'MAINTENANCE',
    EMERGENCY_STOP: 'EMERGENCY_STOP',
    OUT_OF_SERVICE: 'OUT_OF_SERVICE',
    OVERLOADED: 'OVERLOADED'
  } as const;
  export type ElevatorState = typeof ElevatorState[keyof typeof ElevatorState];
  
  export const ElevatorDirection = {
    UP: "UP",
    DOWN: "DOWN",
    IDLE: "IDLE"
  } as const;
  export type ElevatorDirection = typeof ElevatorDirection[keyof typeof ElevatorDirection];
  
  export const ElevatorDoorState = {
    OPEN: "OPEN",
    CLOSED: "CLOSED",
    OPENING: "OPENING",
    CLOSING: "CLOSING"
  } as const;
  export type ElevatorDoorState = typeof ElevatorDoorState[keyof typeof ElevatorDoorState];
  