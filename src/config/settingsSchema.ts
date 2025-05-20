import { z } from 'zod';

/**
 * Zod schema for AppSettings, with defaults and runtime validation/coercion.
 */
export const BuildingsSettingsSchema = z.object({
    numberOfBuildings: z.number().int().positive().default(1).describe("Total number of buildings in the simulation"),
    floorsPerBuilding: z.number().int().positive().default(7),
    elevatorsPerBuilding: z.number().int().positive().default(3),
    initialElevatorFloor: z.number().int().min(0).default(0)
    }).refine(
    (data) => data.initialElevatorFloor < data.floorsPerBuilding,
    {
      message: "Initial elevator floor must be less than the number of floors per building",
      path: ["initialElevatorFloor"], // Path of the error
    }
  )

  export const TimingSettingsSchema = z.object({
    doorOpenTimeMs: z.number().positive().default(2000),
    delayPerFloorMs: z.number().positive().default(1000),
    doorTransitionTimeMs: z.number().positive().default(2000),
    floorTravelTimeMs: z.number().positive().default(500),
  })

  export const SimulationSettingsSchema = z.object({
    simulationTickMs: z.number().positive().default(100),
    simulationSpeedFactor: z.number().positive().default(1),
    currentTime: z.number().nonnegative().default(0),
  })

  export const SettingsSchema = z.object({
    buildings: BuildingsSettingsSchema.default({} as z.input<typeof BuildingsSettingsSchema>),
    timing: TimingSettingsSchema.default({} as z.input<typeof TimingSettingsSchema>),
    simulation: SimulationSettingsSchema.default({} as z.input<typeof SimulationSettingsSchema>),
  });


export type AppSettings = z.infer<typeof SettingsSchema>;