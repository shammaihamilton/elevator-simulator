

import React, { useState, useRef, useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { useEffectiveBuildingSettings } from "@/hooks/useEffectiveBuildingSettings";
import FloorItem from "@/components/floorComponents/FloorItem";
import ElevatorVisual from "@/components/elevatorComponents/ElevatorVisual";
import CustomSettingsBadge from "@/components/common/CustomSettingsBadge";
import BuildingConfigDialog from "@/components/buildingConfigDialog/BuildingConfigDialog";
import styles from "./Building.module.scss";

interface BuildingProps {
  buildingIndex: number;
}

const Building: React.FC<BuildingProps> = ({ buildingIndex }) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // 1) get your dynamic settings
  const { floorsPerBuilding, elevatorsPerBuilding } =
    useEffectiveBuildingSettings(buildingIndex);

  // 2) refs for floors & slots
  const floorRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const layoutRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 3) your simulation managers
  const { managers, resetCounter } = useSimulationStore();
  const manager = managers[buildingIndex];

  // clean up floorRefs if floor count changes
  useEffect(() => {
    const valid = new Set(
      Array.from(
        { length: floorsPerBuilding },
        (_, i) => floorsPerBuilding - 1 - i
      )
    );
    for (const k of Object.keys(floorRefs.current)) {
      if (!valid.has(Number(k))) delete floorRefs.current[Number(k)];
    }
  }, [floorsPerBuilding]);

  if (!manager) return <div>Loading…</div>;

  return (
    <div className={styles.wrapper}>
      {/* header + quick facts */}
      {/* … */}
      <div className={styles.header}>
        <h2>Building {buildingIndex + 1}</h2>
        <CustomSettingsBadge buildingIndex={buildingIndex} style={styles.customBadge}/>
        <button
          className={styles.configBtn}
          onClick={() => setIsConfigOpen(true)}
        >
          ⚙️ Configure
        </button>
      </div>

      {/* Quick facts */}
      <div className={styles.facts}>
        <div>
          <strong >Floors:</strong> {floorsPerBuilding}
        </div>
        <div>
          <strong>Elevators:</strong> {elevatorsPerBuilding}
        </div>
      </div>
      {/* MAIN: floors + elevator shafts share one “layoutRef” */}
      <div className={styles.layout} ref={layoutRef}>
        {/* Floors column */}
        <div className={styles.floors}>
          {Array.from({ length: floorsPerBuilding }).map((_, i) => {
            const floorNum = floorsPerBuilding - 1 - i;
            return (
              <FloorItem
                key={floorNum}
                floorNumber={floorNum}
                buildingIndex={buildingIndex}
                assignFloorRef={(el) => {
                  floorRefs.current[floorNum] = el;
                }}
              />
            );
          })}
        </div>

        {/* Elevator shafts */}
        <div
          className={styles.elevators}
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          {manager.elevators.slice(0, elevatorsPerBuilding).map((elevator) => (
            <div
              key={`${elevator.id}-${resetCounter}`}
              className={styles.elevatorSlot}
              style={{
                flex: "0 0 80px", 
                position: "relative", 
              }}
              ref={(el) => {
                slotRefs.current[elevator.id] = el;
              }}
            >
              <ElevatorVisual
                elevatorFSM={elevator}
                floorRefs={floorRefs.current}
                layoutRef={layoutRef}
                slotRef={slotRefs.current[elevator.id]}
              />
            </div>
          ))}
        </div>
      </div>

      {/* config dialog */}
      <BuildingConfigDialog
        buildingIndex={buildingIndex}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
};

export default Building;
