import { useSimulationStore } from "@/store/simulationStore";
import React, { useEffect, useState } from "react";

interface FloorProps {
  floorNumber: number;
  onRequest: (destination: number) => void;
}

const floorHieght = 110;

const Floor = React.forwardRef<HTMLDivElement, FloorProps>(
  ({ floorNumber, onRequest }, ref) => {

    const [isRequested, setIsRequested] = useState(false);
    const { managers } = useSimulationStore();

    useEffect(() => {
      const checkIfServed = () => {
        // Check all buildings and their elevators
        for (const manager of managers) {
          if (!manager || !manager.elevators) continue;
          
          for (const elevator of manager.elevators) {
            // If an elevator is at this floor with doors open, mark as served
            if (
              elevator.currentFloor === floorNumber && 
              elevator.doorState === "OPEN"
            ) {
              setIsRequested(true);
              
              // Reset the button after the elevator doors close
              const resetTimeout = setTimeout(() => {
                setIsRequested(false);
              }, 1000); // Give enough time for doors to close
              
              return () => clearTimeout(resetTimeout);
            }
            
            // Check if this floor is in the elevator's queue
            const isFloorInQueue = elevator.queue.containsFloor(floorNumber);
            if (isFloorInQueue) {
              setIsRequested(true);
              return;
            }
          }
        }
        
        // If no elevators are serving this floor, reset requested state
        setIsRequested(false);
      };
      
      // Check initially and whenever managers or their state changes
      checkIfServed();
      
      // Set up interval to periodically check (every 500ms)
      const intervalId = setInterval(checkIfServed, 500);
      return () => clearInterval(intervalId);
    }, [floorNumber, managers, isRequested]);

    const handleRequest = () => {
      onRequest(floorNumber);
      setIsRequested(true);
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
        }}
        ref={ref}
      >
        <button
          onClick={
            
            () => {
                console.log("Calling elevator from floor", floorNumber);
                handleRequest()
            }}
            style={{
                border: "black solid 2px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1.2rem",
                backgroundColor: isRequested ? "#4CAF50" : "#007BFF",
                color: isRequested ? "white" : "hsla(0,0%,20%,1)",
                padding: "10px 20px", 
                transition: "background-color 0.3s, color 0.3s",
            }}
        //   style={{ padding: "5px 10px" }}
        >
          <div>{floorNumber}</div>
        </button>
      </div>
    );
  }
);

export default Floor;
