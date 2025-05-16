
import React, { useRef } from "react";
import { useSimulationStore } from "../store/simulationStore";
import Floor from "@/components/Floor";
import ElevatorVisual from "@/components/ElevatorVisual";
import { buildingsSettings } from "@/config/buildingSettings";

const Building: React.FC<{ buildingIndex: number }> = ({ buildingIndex }) => {
  const floorRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const { managers, requestElevator } = useSimulationStore();
  const manager = managers[buildingIndex];
  const totalFloors = buildingsSettings.building.floorsPerBuilding;

  const floorColumnWidth = "250px";
  const elevatorSlotWidth = 100;


  if (!manager || !manager.elevators) {
    return <div>Loading building data...</div>;
  }

  return (
        <div className="" style={{ margin: 50, padding: "20px", border: "1px solid #eee" }}> 
      <h2>Building {buildingIndex + 1}</h2>
      <div style={{ display: "flex", flexDirection: "row", gap: "30px" }}>
        {/* Floors Area */}
        <div style={{ width: floorColumnWidth, position: "relative", display: "flex", flexDirection: "column" }}>
          {Array.from({
            length: totalFloors,
          }).map((_, i) => {
            const floor = totalFloors - 1 - i; 
            return (
              <Floor
                key={floor}
                floorNumber={floor}
                buildingIndex={buildingIndex}
                onRequest={(destinationFloorFromButton) => {
                  console.log(
                    `Building ${
                      buildingIndex + 1
                    }: Requesting elevator. Source: ${floor}, Destination given by button: ${destinationFloorFromButton}`
                  );
                  requestElevator(
                    buildingIndex,
                    floor,
                    destinationFloorFromButton
                  );
                }}
                ref={(el: HTMLDivElement | null) =>
                  (floorRefs.current[floor] = el)
                }
              />
            );
          })}
        </div>

        <div style={{ position: "relative", flexGrow: 1 }}> 
          {manager.elevators.map((elevator, elevatorIndex) => (
            <div
              key={elevator.id}
              style={{
                position: "absolute", 
                top: 0,
                left: `${elevatorIndex * elevatorSlotWidth}px`,
              }}
            >
              <ElevatorVisual
                elevatorFSM={elevator}
                floorRefs={floorRefs.current}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Building;