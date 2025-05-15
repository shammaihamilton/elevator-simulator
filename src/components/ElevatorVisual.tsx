import React, { useEffect, useRef, useState } from "react";
import { IElevatorFSM } from "@/types/interfaces";
import { Elevator as ElevatorComponent } from "./Elevator";
import { ElevatorDoorState } from "../types/enums";
import { getDomBasedYForFloor } from "../utils/floorHelpers";

const FLOOR_VISUAL_HEIGHT = 110; // Matches floorHieght in Floor.tsx
const ELEVATOR_CABIN_HEIGHT = 70; // Matches height in Elevator.tsx

interface ElevatorVisualProps {
  elevatorFSM: IElevatorFSM;
  floorRefs: Record<number, HTMLDivElement | null>;
}

const ElevatorVisual: React.FC<ElevatorVisualProps> = ({
  elevatorFSM,
  floorRefs,
}) => {
  const [y, setY] = useState<number | null>(null);
  const [doorState, setDoorState] = useState<ElevatorDoorState>(
    elevatorFSM.doorState
  );
  const [playDing, setPlayDing] = useState(false);
  const prevFloorRef = useRef(elevatorFSM.currentFloor);
  // const isMountedRef = useRef(false);
  // const initialPositionSet = useRef(false);

  const travelDuration = elevatorFSM.timing.floorTravelTimeMs / 1000; // Convert to seconds

  // This debugging function helps visualize floor positions

  // Set initial position
  useEffect(() => {
    // isMountedRef.current = true;

    // Check if floorRefs are populated
    // console.log(`[${elevatorFSM.id}] Y-Update-Effect: FSM Floor: ${elevatorFSM.currentFloor}, Current Visual Y: ${y}`);
    const allFloorRefsAvailable = Object.values(floorRefs).every(
      (ref) => ref !== null
    );

    if (!allFloorRefsAvailable) {
      // console.warn(`[${elevatorFSM.id}] Y-Update-Effect: Floor refs not fully available for floor ${elevatorFSM.currentFloor}. Visual Y remains ${y}.`);
      // If y is null, we are waiting for initial position.
      // If y is already set, we don't want to clear it here, just wait for refs to become available or for the floor to change.
      return;
    }

    const topOfFloorY = getDomBasedYForFloor(
      elevatorFSM.currentFloor,
      floorRefs
    );
    // console.log(`[${elevatorFSM.id}] Y-Update-Effect: Calculated newY: ${newY} for FSM floor ${elevatorFSM.currentFloor}`);

    if (topOfFloorY !== null) {
      // Adjust Y to center the elevator vertically within the floor's visual height
      const verticalCenteringOffset =
        (FLOOR_VISUAL_HEIGHT - ELEVATOR_CABIN_HEIGHT) / 2;
      const newY = topOfFloorY - verticalCenteringOffset;
      if (y !== newY) {
        // console.log(`[${elevatorFSM.id}] Y-Update-Effect: Setting visual Y from ${y} to ${newY} for FSM floor ${elevatorFSM.currentFloor}`);
        setY(newY);
      }
    } else {
      console.warn(
        `[${elevatorFSM.id}] Y-Update-Effect: Failed to calculate Y for FSM floor ${elevatorFSM.currentFloor}. getDomBasedYForFloor returned null. Visual Y remains ${y}.`
      );
    }
  }, [elevatorFSM.currentFloor, floorRefs, elevatorFSM.id]); // `y` is removed from dependencies as this effect determines `y`.

  // Update position when floor changes
  useEffect(() => {
    if (doorState !== elevatorFSM.doorState) {
      // console.log(`[${elevatorFSM.id}] DoorState-Effect: Syncing door state from FSM: ${elevatorFSM.doorState}. Prev visual state: ${doorState}`);
      setDoorState(elevatorFSM.doorState);
    }
  }, [elevatorFSM.doorState, doorState]);

  // Effect for the "ding" sound
  useEffect(() => {
    // console.log(`[${elevatorFSM.id}] Ding-Effect: FSM Floor: ${elevatorFSM.currentFloor}, Prev Visual Floor: ${prevFloorRef.current}, FSM Door: ${elevatorFSM.doorState}`);
    if (
      prevFloorRef.current !== elevatorFSM.currentFloor &&
      elevatorFSM.doorState === ElevatorDoorState.OPEN
    ) {
      // console.log(`[${elevatorFSM.id}] Ding-Effect: Playing ding. Arrived at ${elevatorFSM.currentFloor} (from ${prevFloorRef.current}), doors OPEN.`);
      setPlayDing(true);
      const timer = setTimeout(() => setPlayDing(false), 700); // Duration of ding sound/display
      // Update prevFloorRef here, as this condition signifies a "dingable" arrival.
      prevFloorRef.current = elevatorFSM.currentFloor;
      return () => clearTimeout(timer);
    }

    // If doors are not OPEN, or floor hasn't changed in a way that triggers a ding,
    // ensure playDing is false if it was true from a previous render.
    if (
      playDing &&
      (elevatorFSM.doorState !== ElevatorDoorState.OPEN ||
        prevFloorRef.current === elevatorFSM.currentFloor)
    ) {
      // console.log(`[${elevatorFSM.id}] Ding-Effect: Conditions not met for ding, ensuring playDing is false.`);
      setPlayDing(false);
    }

    // still update prevFloorRef to correctly detect the *next* arrival.
    if (prevFloorRef.current !== elevatorFSM.currentFloor) {
      // console.log(`[${elevatorFSM.id}] Ding-Effect: FSM floor ${elevatorFSM.currentFloor} differs from prev visual ${prevFloorRef.current}. Updating prevFloorRef.`);
      prevFloorRef.current = elevatorFSM.currentFloor;
    }
  }, [
    elevatorFSM.currentFloor,
    elevatorFSM.doorState,
    playDing,
    elevatorFSM.id,
  ]); // Added playDing and id for completeness.

  if (y === null) {
    console.log(
      `[${elevatorFSM.id}] Visual Y is null, not rendering ElevatorComponent yet.`
    );
    return null; // Don't render the elevator until its Y position is known
  }

  return (
    <ElevatorComponent
      y={y}
      doorState={doorState}
      playDing={playDing}
      animationDuration={travelDuration}
      elevatorFSM={elevatorFSM}
    />
  );
};

export default ElevatorVisual;
