import { IElevatorFSM } from "../interfaces/elevatorFSM.inteface";



function willLikelyPassFloor(elevator: IElevatorFSM, floor: number): boolean {
  const current = elevator.currentFloor;
  const queueArray = elevator.queue.toArray(); // Ensure it's safe

  if (queueArray.length === 0) return false;

  // Estimate path by comparing floor with current and ALL upcoming stops
  for (const stop of queueArray) {
    const stopFloor = stop.destinationFloor ? stop.destinationFloor : stop.sourceFloor;

    // Is the target floor in between current floor and any stop floor?
    const between = (current < floor && floor < stopFloor) || (current > floor && floor > stopFloor);
    if (between) return true;
  }

  return false;
}

export default willLikelyPassFloor;