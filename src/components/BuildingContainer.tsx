import React, { useEffect, useRef } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import Building from "@/components/Building";

const BuildingContainer: React.FC = () => {
  const settings = useSimulationStore((state) => state.settings);
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
      console.log(
        "BuildingContainer Effect: Simulation is paused, not setting interval"
      );
      return;
    }

    console.log(
      "BuildingContainer Effect: Setting up simulation interval. Tick rate:",
      simulationTickMs
    );
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
    <div className="flex flex-col items-center p-5">
      <div className="flex justify-center w-full max-w-3xl mb-6">
        <div className="flex gap-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => resetSimulation()}
          >
            Restart Simulation
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => {
              if (isSimPaused) resumeSim();
              else pauseSim();
            }}
          >
            {isSimPaused ? "Resume Simulation" : "Pause Simulation"}
          </button>
        </div>
      </div>

      {/* Buildings Display Area */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {Array.from({ length: settings.buildings.buildings }).map((_, idx) => (
          <div key={idx} className="relative" style={{ flex: "0 0 300px" }}>
            <Building buildingIndex={idx} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildingContainer;
