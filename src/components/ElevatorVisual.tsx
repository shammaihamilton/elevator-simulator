
import React, { useEffect, useRef, useState } from "react";
import { IElevatorFSM } from "@/types/interfaces";
import { Elevator as ElevatorComponent } from "./Elevator";
import { ElevatorDoorState } from "../types/enums";
import { getDomBasedYForFloor } from "../utils/floorHelpers";

const FLOOR_VISUAL_HEIGHT = 110; 
const ELEVATOR_CABIN_HEIGHT = 70; 

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

  const travelDuration = elevatorFSM.timing.floorTravelTimeMs / 1000; 


  useEffect(() => {
    const allFloorRefsAvailable = Object.values(floorRefs).every(
      (ref) => ref !== null
    );

    if (!allFloorRefsAvailable) {
      return;
    }

    const topOfFloorY = getDomBasedYForFloor(
      elevatorFSM.currentFloor,
      floorRefs
    );

    if (topOfFloorY !== null) {
      const verticalCenteringOffset =
        (FLOOR_VISUAL_HEIGHT - ELEVATOR_CABIN_HEIGHT) / 2;
      const newY = topOfFloorY + verticalCenteringOffset;
      if (y !== newY) {
        setY(newY);
      }
    } else {
      console.warn(
        `[${elevatorFSM.id}] Y-Update-Effect: Failed to calculate Y for FSM floor ${elevatorFSM.currentFloor}. getDomBasedYForFloor returned null. Visual Y remains ${y}.`
      );
    }
  }, [elevatorFSM.currentFloor, floorRefs, elevatorFSM.id]);

  // Sync local doorState with FSM's doorState
  useEffect(() => {
    if (doorState !== elevatorFSM.doorState) {
      setDoorState(elevatorFSM.doorState);
    }
  }, [elevatorFSM.doorState, doorState]); 

  useEffect(() => {
    if (
      prevFloorRef.current !== elevatorFSM.currentFloor &&
      elevatorFSM.doorState === ElevatorDoorState.OPEN
    ) {
      setPlayDing(true);
      const timer = setTimeout(() => setPlayDing(false), 700); // Duration of ding sound/display
      prevFloorRef.current = elevatorFSM.currentFloor;
      return () => clearTimeout(timer);
    }

    // If doors are not OPEN, or floor hasn't changed in a way that triggers a ding,
    // ensure playDing is false if it was true from a previous render.
    if (playDing && (elevatorFSM.doorState !== ElevatorDoorState.OPEN || prevFloorRef.current === elevatorFSM.currentFloor)) {
        // console.log(`[${elevatorFSM.id}] Conditions not met for ding, ensuring playDing is false.`);
        setPlayDing(false);
    }


    if (prevFloorRef.current !== elevatorFSM.currentFloor) {
      prevFloorRef.current = elevatorFSM.currentFloor;
    }
  }, [
    elevatorFSM.currentFloor,
    elevatorFSM.doorState,
    playDing, 
    elevatorFSM.id,
  ]);

  if (y === null) {

    return null; 
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
