

import React, { useEffect } from "react";
import { buildingsSettings } from "@/config/buildingSettings";
import Building from "@/components/Building";
import { useSimulationStore } from "@/store/simulationStore";
import { SimulationControls } from '@components/SimulationControls';


const BuildingContainer: React.FC = () => {
  const tick = useSimulationStore((state) => state.tick);
  const simulationTickMs = useSimulationStore(
    (state) => state.settings.simulation.simulationTickMs
  );
  const resetSimulation = useSimulationStore((state) => state.reset);
  const pauseSim = useSimulationStore((state) => state.pauseSimulation);
  const resumeSim = useSimulationStore((state) => state.resumeSimulation);
  const isSimPaused = useSimulationStore((state) => state.isPaused);

  const [isSimulationRunning, setIsSimulationRunning] = React.useState(true);

  useEffect(() => {
    if (!isSimulationRunning) return;
    console.log("Setting up simulation interval. Tick rate:", simulationTickMs);
    const intervalId = setInterval(() => {
      tick();
    }, simulationTickMs);

    return () => {
      console.log("Clearing simulation interval.");
      clearInterval(intervalId);
    };
  }, [tick, simulationTickMs, isSimulationRunning]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" /* Added overall padding */ }}
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
            setIsSimulationRunning(true);
          }}
        >
          Restart Simulation
        </button>
        <button
          onClick={() => {
            setIsSimulationRunning(false);
            
            if (isSimPaused) {
              resumeSim();
            } else {
              pauseSim();
            };
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
        
        {/* Controls Column */}
        <div style={{ flexShrink: 0 /* Prevent controls from shrinking */ }}>
          <SimulationControls  />
        </div>

        {/* Buildings Display Area (will take remaining space and wrap buildings) */}
        <div
          style={{
            flexGrow: 1, // Allow this area to grow and take up remaining horizontal space
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center", // Center buildings if they don't fill the width
            // alignItems: "flex-start", // Align buildings to the top of their rows
          }}
        >
          {Array.from({ length: buildingsSettings.building.buildings }).map(
            (_, idx) => (
              <div
                key={idx}
                style={{
                  margin: "10px", // Margin around each building
                  position: "relative", // For internal positioning if Building component needs it
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
