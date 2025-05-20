
import React, { useState, useLayoutEffect, useRef } from "react";
import { IElevatorFSM } from "@/interfaces";
import { Elevator } from "./Elevator";
import { ElevatorDoorState } from "@/types/enums";

const CABIN_H = 70, FLOOR_H = 110;

interface Props {
  elevatorFSM: IElevatorFSM;
  floorRefs: Record<number, HTMLDivElement | null>;
  layoutRef: React.RefObject<HTMLDivElement>;
  slotRef?: HTMLDivElement | null;
}

const ElevatorVisual: React.FC<Props> = ({
  elevatorFSM,
  floorRefs,
  layoutRef,
  slotRef,
}) => {
  const [y, setY] = useState<number | null>(null);
  const [doorState, setDoor] = useState(elevatorFSM.doorState);
  const [playDing, setDing] = useState(false);
  const prevFloorRef = useRef(elevatorFSM.currentFloor);

  useLayoutEffect(() => {
    if (!slotRef) return;
    const floorEl = floorRefs[elevatorFSM.currentFloor];
    if (!floorEl || !layoutRef.current) return;

    const floorRect = floorEl.getBoundingClientRect();
    const slotRect = slotRef.getBoundingClientRect();
    const offset = (FLOOR_H - CABIN_H) / 2;

    // Calculate position relative to the slot
    // Since floors are arranged Floor 6 at top, Floor 0 at bottom,
    // floorRect.top - slotRect.top gives us the correct relative position
    const relativeY = floorRect.top - slotRect.top + offset;
    
    setY(Math.max(0, relativeY));
    
    // Debug logging to see what's happening
    // console.log(`Elevator ${elevatorFSM.id}: Floor ${elevatorFSM.currentFloor}`, {
    //   floorTop: floorRect.top,
    //   slotTop: slotRect.top,
    //   relativeY,
    //   finalY: Math.max(0, relativeY),
    //   floorHeight: FLOOR_H,
    //   cabinHeight: CABIN_H,
    //   offset
    // });
  }, [elevatorFSM.currentFloor, floorRefs, slotRef, layoutRef, elevatorFSM.id]);

  // sync doors + ding
  useLayoutEffect(() => {
    setDoor(elevatorFSM.doorState);
    const moved = prevFloorRef.current !== elevatorFSM.currentFloor;
    if (moved && elevatorFSM.doorState === ElevatorDoorState.OPEN) {
      setDing(true);
      const t = setTimeout(() => setDing(false), 500);
      return () => clearTimeout(t);
    }
    prevFloorRef.current = elevatorFSM.currentFloor;
  }, [elevatorFSM.currentFloor, elevatorFSM.doorState]);

  // Don't render elevator until position is calculated
  if (y === null) {
    return null;
  }

  return (
    <Elevator
      y={y}
      doorState={doorState}
      playDing={playDing}
      animationDuration={elevatorFSM.timing.floorTravelTimeMs / 1000}
      elevatorFSM={elevatorFSM}
    />
  );
};

export default ElevatorVisual;

