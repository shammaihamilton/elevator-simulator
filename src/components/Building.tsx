
import React, { useState, useRef, useEffect } from "react";
import BuildingConfigDialog from "./BuildingConfigDialog";
import  CustomSettingsBadge from "./CustomSettingsBadge";
import { useEffectiveBuildingSettings  } from "@/hooks/useEffectiveBuildingSettings";
import { useSimulationStore } from "@/store/simulationStore";
import ElevatorVisual from "@/components/ElevatorVisual";
import FloorItem from "./FloorItem";

interface BuildingProps {
  buildingIndex: number;
}

const Building: React.FC<BuildingProps> = ({ buildingIndex }) => {
  /** --- UI state --- */
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  /** --- Settings --- */
  const buildingSettings = useEffectiveBuildingSettings(buildingIndex);
  const totalFloors = buildingSettings.floorsPerBuilding;
  const elevatorsPerBuilding = buildingSettings.elevatorsPerBuilding;

  /** --- Simulation data --- */
  const floorRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const { managers, resetCounter } = useSimulationStore();
  const manager = managers[buildingIndex];

  // Building.tsx - Ref cleanup (more advanced)
  useEffect(() => {
  const currentFloorKeys = Array.from({ length: totalFloors }, (_, i) => totalFloors - 1 - i);
  const oldRefKeys = Object.keys(floorRefs.current).map(Number);

  for (const oldKey of oldRefKeys) {
    if (!currentFloorKeys.includes(oldKey)) {
      delete floorRefs.current[oldKey]; // Remove refs for floors that no longer exist
    }
  }
  // This effect should run when totalFloors changes
}, [totalFloors]);
  if (!manager || !manager.elevators) {
    return <div>Loading building data…</div>;
  }

  /** --- Layout constants --- */
  const floorColumnWidth = 250;
  const elevatorSlotWidth = 100;

  return (
    <div style={{ margin: 50, padding: "20px", border: "1px solid #eee" }} className="">
      {/* ---------- Header ---------- */}
      <div className="">
        <div  className="">
          <h2 className="">Building {buildingIndex + 1}</h2>
          <CustomSettingsBadge buildingIndex={buildingIndex} />
        </div>

        <button
          onClick={() => setIsConfigOpen(true)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm flex items-center"
        >
          <span className="mr-1">⚙️</span> Configure
        </button>
      </div>

      {/* ---------- Quick facts ---------- */}
      <div className="text-sm text-gray-600 mb-4">
        <div>
          <strong>Floors:</strong> {totalFloors}
        </div>
        <div>
          <strong>Elevators:</strong> {elevatorsPerBuilding}
        </div>
      </div>

      {/* ---------- Main visualization ---------- */}
        

      <div style={{ display: "flex", flexDirection: "row", gap: "30px" }} className="">
        {/* Floors column */}
        <div
          style={{
            width: floorColumnWidth,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            border: "4px solid black",
          }}
        >
          {Array.from({ length: totalFloors }).map((_, i) => {
            const floor = totalFloors - 1 - i; // render from top → bottom



            return (
              <FloorItem
                key={floor}
                floorNumber={floor}
                buildingIndex={buildingIndex}
                assignFloorRef={(el: HTMLDivElement | null) => {
                  floorRefs.current[floor] = el;
                }}
              />
            );
          })}
        </div>

        {/* Elevator shafts */}
        <div style={{ position: "relative", flexGrow: 1 }}>
          {manager.elevators.slice(0, elevatorsPerBuilding).map((elevator, elevatorIndex) => (
            <div
              key={`${elevator.id}-${resetCounter}`}
              style={{
                position: "absolute",
                left: elevatorIndex * elevatorSlotWidth,
                top: 0,
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

      {/* ---------- Config dialog ---------- */}
      <BuildingConfigDialog
        buildingIndex={buildingIndex}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
};

export default Building;

