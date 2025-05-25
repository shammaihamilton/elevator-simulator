import { DispatchStrategy } from '@/types/enums';
import { z } from 'zod';

/**
 * A standalone schema for choosing an elevator‐dispatch strategy.
 */
export const DispatchStrategySchema = z
  .nativeEnum(DispatchStrategy)
  .describe('Elevator dispatch strategy');

/**
 * Zod schema for per‐building settings, with a default
 * dispatchStrategy of ETA_ONLY at the building level.
 */
export const BuildingsSettingsSchema = z
  .object({
    numberOfBuildings: z
      .number()
      .int()
      .positive()
      .default(1)
      .describe('Total number of buildings in the simulation'),
    floorsPerBuilding: z
      .number()
      .int()
      .min(2)
      .positive()
      .default(7)
      .describe('Number of floors per building'),
    elevatorsPerBuilding: z
      .number()
      .int()
      .positive()
      .default(3)
      .describe('Number of elevators per building'),
    initialElevatorFloor: z
      .number()
      .int()
      .min(0)
      .default(0)
      .describe('Initial floor of the elevator'),
    dispatchStrategy: DispatchStrategySchema.default(
      DispatchStrategy.ETA_ONLY
    ),
  })
  .refine(
    (data) => data.initialElevatorFloor < data.floorsPerBuilding,
    {
      message:
        'Initial elevator floor must be less than the number of floors per building',
      path: ['initialElevatorFloor'],
    }
  )
  .refine(
    (data) => data.elevatorsPerBuilding <= data.floorsPerBuilding,
    {
      message:
        'Number of elevators per building must be ≤ the number of floors per building',
      path: ['elevatorsPerBuilding'],
    }
  );

/**
 * Zod schema for all timing-related settings.
 */
export const TimingSettingsSchema = z.object({
  doorOpenTimeMs: z.number().positive().default(500),
  delayPerFloorMs: z.number().positive().default(1000), // Aligned with your default
  doorTransitionTimeMs: z.number().positive().default(500),
  floorTravelTimeMs: z.number().positive().default(500),
});

/**
 * Zod schema for the simulation loop.
 */
export const SimulationSettingsSchema = z.object({
  simulationTickMs: z.number().positive().default(500),
  simulationSpeedFactor: z.number().positive().default(1),
  currentTime: z.number().nonnegative().default(0),
});

/**
 * Top-level settings schema: includes per‐building, timing, and simulation.
 */
export const SettingsSchema = z.object({
  buildings: BuildingsSettingsSchema.default(
    {} as z.input<typeof BuildingsSettingsSchema>
  ),
  timing: TimingSettingsSchema.default(
    {} as z.input<typeof TimingSettingsSchema>
  ),
  simulation: SimulationSettingsSchema.default(
    {} as z.input<typeof SimulationSettingsSchema>
  ),
});

export type AppSettings = z.infer<typeof SettingsSchema>;