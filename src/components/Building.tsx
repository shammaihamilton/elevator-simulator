import React, { useEffect, useRef, useState } from "react";
import { useSimulationStore } from "../store/simulationStore";
import Floor from "@/components/Floor";
import ElevatorVisual from "@/components/ElevatorVisual";
import { buildingsSettings } from "@/config/buildingSettings";

const Building: React.FC<{ buildingIndex: number }> = ({ buildingIndex }) => {
  const floorRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const { managers, requestElevator } = useSimulationStore();
  const manager = managers[buildingIndex];
  const [rerenderTrigger, setRerenderTrigger] = useState(0);
  const totalFloors = buildingsSettings.building.floorsPerBuilding;

  if (!manager || !manager.elevators) {
    return <div>Loading building data...</div>;
  }

  // useEffect(() => {
  //   const handleResize = () => {
  //     setRerenderTrigger(rerenderTrigger + 1);
  //   };
  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, [rerenderTrigger]);

  if (!manager || !manager.elevators) {
    return <div>Loading building data...</div>;
  }

  return (
    <div className="" style={{ position: "relative", margin: 50 }}>
      <h2>Building {buildingIndex + 1}</h2>
      {/* Floors (top-down) */}
      {Array.from({
        length: totalFloors,
      }).map((_, i) => {
        const floor = totalFloors  - 1 - i;
        return (
          <Floor
            key={floor}
            floorNumber={floor} 
            onRequest={(destinationFloorFromButton) => { 

              console.log(`Building ${buildingIndex + 1}: Requesting elevator. Source: ${floor}, Destination given by button: ${destinationFloorFromButton}`);
              requestElevator(buildingIndex,  floor, destinationFloorFromButton);
            }}
            ref={(el: HTMLDivElement | null) => (floorRefs.current[floor] = el)}
          />
        );
      })}

      {/* Elevator visuals */}
      <div style={{ display: "flex" }}>

      {manager.elevators.map((elevator, elevatorIndex) => (
       <div key={elevator.id} style={{  position: "absolute", top: 0, left: `${200 + (elevatorIndex * 100)}px` }}>
        <ElevatorVisual
        key={elevator.id}
        elevatorFSM={elevator}
        floorRefs={floorRefs.current}
        />
        </div>
      ))}
      </div>
    </div>
  );
};

export default Building;
