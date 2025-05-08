// enums.ts
export const ElevatorState = {
    IDLE: "IDLE",
    MOVING_UP: "MOVING_UP",
    MOVING_DOWN: "MOVING_DOWN",
    DOOR_OPEN: "DOOR_OPEN",
    DOOR_CLOSING: "DOOR_CLOSING",
  } as const;
  
  export type ElevatorState = typeof ElevatorState[keyof typeof ElevatorState];
  
// Add Direction type for clarity
export const Direction = {
    UP: 1,
    DOWN: -1,
    NONE: 0
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

  export const ElevatorDirection = {
    UP: "UP",
    DOWN: "DOWN",
  } as const;
  
  export type ElevatorDirection = typeof ElevatorDirection[keyof typeof ElevatorDirection];
  
  export const ElevatorDoorState = {
    OPEN: "OPEN",
    CLOSED: "CLOSED",
  } as const;
  
  export type ElevatorDoorState = typeof ElevatorDoorState[keyof typeof ElevatorDoorState];
  
  export const ElevatorButtonState = {
    PRESSED: "PRESSED",
    RELEASED: "RELEASED",
  } as const;
  
  export type ElevatorButtonState = typeof ElevatorButtonState[keyof typeof ElevatorButtonState];
  
  export const ElevatorButtonType = {
    CALL: "CALL",
    FLOOR: "FLOOR",
  } as const;
  
  export type ElevatorButtonType = typeof ElevatorButtonType[keyof typeof ElevatorButtonType];
  
  export const ElevatorButtonDirection = {
    UP: "UP",
    DOWN: "DOWN",
  } as const;
  
  export type ElevatorButtonDirection = typeof ElevatorButtonDirection[keyof typeof ElevatorButtonDirection];