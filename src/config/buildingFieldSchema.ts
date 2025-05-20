// src/config/buildingFieldSchema.ts
import type { BuildingFormData } from "@/components/buildingConfigDialog/BuildingConfigDialog";

export type FieldDef<K extends keyof BuildingFormData> = {
  key: K;
  label: string;
  min?: number;
  step?: number;
};

export const buildingFieldSchema: Record<
  "buildingParams" | "timingParams",
  FieldDef<keyof BuildingFormData>[]
> = {
  buildingParams: [
    { key: "floorsPerBuilding", label: "Floors", min: 2 },
    { key: "elevatorsPerBuilding", label: "Elevators", min: 1 },
    { key: "initialElevatorFloor", label: "Initial Elevator Floor", min: 0 },
  ],
  timingParams: [
    { key: "doorOpenTimeMs", label: "Door Open Time (ms)", min: 100 },
    { key: "delayPerFloorMs", label: "Delay per Floor (ms)", min: 100 },
    { key: "doorTransitionTimeMs", label: "Door Transition (ms)", min: 100 },
    { key: "floorTravelTimeMs", label: "Floor Travel Time (ms)", min: 100 },
  ],
};
