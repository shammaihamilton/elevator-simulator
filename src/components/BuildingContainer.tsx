import React, { useEffect } from "react";
import { buildingsSettings } from "@/config/buildingSettings";
import Building from "@/components/Building";
import { useSimulationStore } from "@/store/simulationStore";

const BuildingContainer: React.FC = () => {
  const tick = useSimulationStore((state) => state.tick);
  const simulationTickMs = useSimulationStore(
    (state) => state.settings.simulation.simulationTickMs
  );
  const resetSimulation = useSimulationStore((state) => state.reset);
  const stopSimulation = useSimulationStore((state) => state.stop);
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
  }, [tick, simulationTickMs]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1>Elevator Simulation</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
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
            stopSimulation(); 
          }}
        >
          Stop Simulation
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {Array.from({ length: buildingsSettings.building.buildings }).map(
          (_, idx) => (
            <div
              key={idx}
              style={{
                margin: "60px",
                width: "100%",
                height: "100%",
                position: "relative",
              }}
            >
              <Building key={idx} buildingIndex={idx} />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default BuildingContainer;
