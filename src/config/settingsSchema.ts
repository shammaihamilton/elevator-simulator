import { z } from 'zod';


export const BuildingsSettingsSchema = z.object({
    numberOfBuildings: z.number().int().positive().default(1).describe("Total number of buildings in the simulation"),
    floorsPerBuilding: z.number().int().min(2).positive().default(7),
    elevatorsPerBuilding: z.number().int().positive().default(1),
    initialElevatorFloor: z.number().int().min(0).default(0)
    }).refine(
    (data) => data.initialElevatorFloor < data.floorsPerBuilding,
    {
      message: "Initial elevator floor must be less than the number of floors per building",
      path: ["initialElevatorFloor"], // Path of the error
    }
    ).refine(
    (data) => data.elevatorsPerBuilding <= data.floorsPerBuilding,
    {
      message: "Number of elevators per building must be less than or equal to the number of floors per building",
      path: ["elevatorsPerBuilding"], // Path of the error
    }
  )

  export const TimingSettingsSchema = z.object({
    doorOpenTimeMs: z.number().positive().default(500),
    delayPerFloorMs: z.number().positive().default(2000),
    doorTransitionTimeMs: z.number().positive().default(200),
    floorTravelTimeMs: z.number().positive().default(500),
  })

  export const SimulationSettingsSchema = z.object({
    simulationTickMs: z.number().positive().default(500),
    simulationSpeedFactor: z.number().positive().default(1),
    currentTime: z.number().nonnegative().default(0),
  })

  export const SettingsSchema = z.object({
    buildings: BuildingsSettingsSchema.default({} as z.input<typeof BuildingsSettingsSchema>),
    timing: TimingSettingsSchema.default({} as z.input<typeof TimingSettingsSchema>),
    simulation: SimulationSettingsSchema.default({} as z.input<typeof SimulationSettingsSchema>),
  });


export type AppSettings = z.infer<typeof SettingsSchema>;