export const GlobalSystemState = {
    NORMAL: "NORMAL",
    FIRE_ALARM: "FIRE_ALARM",
    POWER_OUTAGE: "POWER_OUTAGE",
    EARTHQUAKE: "EARTHQUAKE",
    SECURITY_LOCKDOWN: "SECURITY_LOCKDOWN"
  } as const;
  export type GlobalSystemState = typeof GlobalSystemState[keyof typeof GlobalSystemState];
  