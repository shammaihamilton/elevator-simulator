// src/components/FloorItem.tsx (or similar path)
import React, { useCallback } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import Floor from '@/components/Floor';
interface FloorItemProps {
  buildingIndex: number;
  floorNumber: number;
  assignFloorRef: (el: HTMLDivElement | null) => void; // For passing the ref
}

const FloorItem: React.FC<FloorItemProps> = ({
  buildingIndex,
  floorNumber,
  assignFloorRef,
}) => {
  // Hook is at the top level of FloorItem
  const requestElevator = useSimulationStore((state) => state.requestElevator);

  // useCallback is now at the top level of FloorItem
  // Floor.tsx's onRequest prop is defined as:
  // onRequest: (destinationFloorFromButton: number, sourceFloor: number) => void;
  // And Floor.tsx calls it as: onRequest(floorNumber, floorNumber);
  // So, both destinationFloor and sourceFloor passed from Floor.tsx will be its own floorNumber.
  const handleInternalRequest = useCallback(
    (destinationFloorClicked: number, sourceFloorClicked: number) => {
      // Here, destinationFloorClicked === floorNumber and sourceFloorClicked === floorNumber
      // This means a call from Floor X results in a request for an elevator to Floor X,
      // with Floor X being both the source and (initial) destination.
      requestElevator(buildingIndex, sourceFloorClicked, destinationFloorClicked);
    },
    [requestElevator, buildingIndex] // floorNumber is implicitly part of source/destinationFloorClicked
  );

  return (
    <Floor
      floorNumber={floorNumber}
      buildingIndex={buildingIndex}
      onRequest={handleInternalRequest} // Pass the memoized handler
      ref={assignFloorRef} // Pass the ref assignment function down
    />
  );
};

// Optional: Memoize FloorItem if its props (buildingIndex, floorNumber, assignFloorRef)
// are stable and FloorItem is expensive to render.
// assignFloorRef is a function, so if it's redefined on every Building render, memo might not help much here
// unless assignFloorRef itself is memoized in Building.tsx (which it isn't currently).
// For now, let's keep it simple. You can add memo later if performance dictates.
export default FloorItem;