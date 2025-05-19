import React, { useEffect, useRef } from "react";
import { appSettings } from "@/config/appSettings";
import Building from "@/components/Building";
import { useSimulationStore } from "@/store/simulationStore";
import { SimulationControls } from "./SimulationControls";

const BuildingContainer: React.FC = () => {
  const tick = useSimulationStore((state) => state.tick);
  const simulationTickMs = useSimulationStore(
    (state) => state.settings.simulation.simulationTickMs
  );
  const resetSimulation = useSimulationStore((state) => state.reset);
  const pauseSim = useSimulationStore((state) => state.pauseSimulation);
  const resumeSim = useSimulationStore((state) => state.resumeSimulation);
  const isSimPaused = useSimulationStore((state) => state.isPaused);
  
  // Use a ref to track if we have an active interval
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing interval first to prevent duplicates
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isSimPaused) {
      console.log("BuildingContainer Effect: Simulation is paused, not setting interval");
      return;
    }
    
    console.log("BuildingContainer Effect: Setting up simulation interval. Tick rate:", simulationTickMs);
    // Store the interval ID in our ref
    intervalRef.current = window.setInterval(() => {
      tick();
    }, simulationTickMs);

    return () => {
      console.log("BuildingContainer Effect: Cleaning up simulation interval");
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tick, simulationTickMs, isSimPaused]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}
    >
      <h1>Elevator Simulation</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          width: "100%",
          maxWidth: "500px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => {
            resetSimulation();
          }}
        >
          Restart Simulation
        </button>
        <button
          onClick={() => {
            if (isSimPaused) resumeSim(); else pauseSim();
          }}
        >
          {isSimPaused ? "Resume Simulation" : "Pause Simulation"} 
        </button>
      </div>

      {/* Container for buildings */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-start",
          width: "100%",
          marginTop: "20px", 
        }}
      >
        {/* Buildings Display Area */}
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <SimulationControls />
          {Array.from({ length: appSettings.buildings.buildings }).map(
            (_, idx) => (
              <div
                key={idx}
                style={{
                  margin: "10px",
                  position: "relative",
                }}
              >
                <Building buildingIndex={idx} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildingContainer;