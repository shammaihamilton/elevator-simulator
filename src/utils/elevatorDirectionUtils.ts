import { ElevatorDirection } from "../types/enums";

export function isMovingDirection(direction: ElevatorDirection): direction is "UP" | "DOWN" {
  return direction === ElevatorDirection.UP || direction === ElevatorDirection.DOWN;
}
