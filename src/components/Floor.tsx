

import { useSimulationStore } from "@/store/simulationStore";
import React, { useEffect, useState, useCallback } from "react";
import { ElevatorDoorState } from "@/types/enums";

interface FloorProps {
  floorNumber: number;
  buildingIndex: number; 
  onRequest: (destination: number) => void;
}

const floorHieght = 110; 

const Floor = React.forwardRef<HTMLDivElement, FloorProps>(
  ({ floorNumber, onRequest, buildingIndex }, ref) => {
    const [callState, setCallState] = useState<'idle' | 'pending' | 'serviced'>('idle');
    const manager = useSimulationStore((state) => state.managers[buildingIndex]);

    const updateCallState = useCallback(() => {
      if (!manager || !manager.elevators) {
        setCallState('idle');
        return;
      }

      let isCurrentlyServiced = false;
      for (const elevator of manager.elevators) {
        if (
          elevator.currentFloor === floorNumber &&
          (elevator.doorState === ElevatorDoorState.OPEN || elevator.doorState === ElevatorDoorState.OPENING)
        ) {
          isCurrentlyServiced = true;
          break;
        }
      }

      if (isCurrentlyServiced) {
        setCallState('serviced');
        return;
      }

      let isCurrentlyPending = false;
      for (const elevator of manager.elevators) {
        if (elevator.queue.containsFloor(floorNumber)) {
          isCurrentlyPending = true;
          break;
        }
      }

      if (isCurrentlyPending) {
        setCallState('pending');
      } else {
        setCallState('idle');
      }
    }, [floorNumber, manager]); 
    useEffect(() => {
      updateCallState(); 
      const intervalId = setInterval(updateCallState, 500); 
      return () => clearInterval(intervalId);
    }, [updateCallState]);

    const handleRequest = () => {
      onRequest(floorNumber); 
      setCallState('pending'); 
    };

    return (
      <div
        className="floor"
        style={{
          height: floorHieght,
          border: "2px solid black",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 50px",
          backgroundColor: (callState === 'pending' || callState === 'serviced') ? "#e0ffe0" : "transparent",
          transition: "background-color 0.3s ease",
        }}
        ref={ref}
      >
        <span
          style={{
            fontSize: "1rem",
            color: "black",
            fontWeight: "bold",
            marginRight: "10px",
          }}
        >
          Floor {floorNumber}
        </span>
        <button
          onClick={handleRequest}
          style={{
            border: "black solid 2px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1rem",
            backgroundColor:
              callState === 'serviced' ? '#4CAF50' : // Green if serviced
              callState === 'pending' ? '#FFC107' :  // Yellow/Orange if pending
              '#007BFF', // Blue if idle
            color: "white", // Text color for all states
            padding: "10px 20px",
            transition: "background-color 0.3s, color 0.3s, opacity 0.3s",

            opacity: callState === 'serviced' ? 0.7 : 1,
          }}
          disabled={callState === 'serviced'}
        >
          Call
        </button>
      </div>
    );
  }
);

Floor.displayName = "Floor"; 
export default Floor;