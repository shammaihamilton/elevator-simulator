export const GlobalSystemState = {
    NORMAL: "NORMAL",
    FIRE_ALARM: "FIRE_ALARM",
    POWER_OUTAGE: "POWER_OUTAGE",
    EARTHQUAKE: "EARTHQUAKE",
    SECURITY_LOCKDOWN: "SECURITY_LOCKDOWN",
    EMERGENCY_STOP_ALL: "EMERGENCY_STOP_ALL"
  } as const;
  export type GlobalSystemState = typeof GlobalSystemState[keyof typeof GlobalSystemState];
  