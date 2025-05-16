import { useSimulationStore } from "@/store/simulationStore";
import React, { useEffect, useState } from "react";
import { ElevatorDoorState } from "@/types/enums";
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
        for (const manager of managers) {
          if (!manager || !manager.elevators) continue;
          
          for (const elevator of manager.elevators) {
            if (
              elevator.currentFloor === floorNumber && 
              elevator.doorState === ElevatorDoorState.OPEN
            ) {
              setIsRequested(true);
              
              const resetTimeout = setTimeout(() => {
                setIsRequested(false);
              }, 1000); 
              
              return () => clearTimeout(resetTimeout);
            }
            
            const isFloorInQueue = elevator.queue.containsFloor(floorNumber);
            if (isFloorInQueue) {
              setIsRequested(true);
              return;
            }
          }
        }
        setIsRequested(false);
      };
      checkIfServed();
    
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
        >
          <div>{floorNumber}</div>
        </button>
      </div>
    );
  }
);

export default Floor;
