export const ButtonState = {
    PRESSED: "PRESSED",
    RELEASED: "RELEASED"
  } as const;
  export type ButtonState = typeof ButtonState[keyof typeof ButtonState];
  
  export const ButtonType = {
    CALL_UP: "CALL_UP",
    CALL_DOWN: "CALL_DOWN",
    FLOOR_TARGET: "FLOOR_TARGET",
    EMERGENCY_STOP_ELEVATOR: "EMERGENCY_STOP_ELEVATOR",
    DOOR_OPEN_BUTTON: "DOOR_OPEN_BUTTON",
    DOOR_CLOSE_BUTTON: "DOOR_CLOSE_BUTTON"
  } as const;
  export type ButtonType = typeof ButtonType[keyof typeof ButtonType];
  