import React, { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { AppSettings } from "@/interfaces";

const GlobalConfigPage: React.FC = () => {
  const settings = useSimulationStore((state) => state.settings);
  const updateSettings = useSimulationStore((state) => state.updateSettings);
  
  // Create local state to track form changes
  const [formData, setFormData] = useState<AppSettings>(settings);
  
  const handleChange = (section: keyof AppSettings, field: string, value: any) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: typeof value === "string" && !isNaN(Number(value)) ? Number(value) : value,
      },
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Global Configuration</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Building Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Number of Buildings</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={formData.buildings.buildings}
                onChange={(e) => handleChange("buildings", "buildings", e.target.value)}
                min={1}
              />
            </div>
            <div>
              <label className="block mb-1">Floors per Building</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={formData.buildings.floorsPerBuilding}
                onChange={(e) => handleChange("buildings", "floorsPerBuilding", e.target.value)}
                min={2}
              />
            </div>
            <div>
              <label className="block mb-1">Elevators per Building</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={formData.buildings.elevatorsPerBuilding}
                onChange={(e) => handleChange("buildings", "elevatorsPerBuilding", e.target.value)}
                min={1}
              />
            </div>
            <div>
              <label className="block mb-1">Initial Elevator Floor</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={formData.buildings.initialElevatorFloor}
                onChange={(e) => handleChange("buildings", "initialElevatorFloor", e.target.value)}
                min={0}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Timing Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Door Open Time (ms)</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={formData.timing.doorOpenTimeMs}
                onChange={(e) => handleChange("timing", "doorOpenTimeMs", e.target.value)}
                min={100}
              />
            </div>
            <div>
              <label className="block mb-1">Delay per Floor (ms)</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={formData.timing.delayPerFloorMs}
                onChange={(e) => handleChange("timing", "delayPerFloorMs", e.target.value)}
                min={100}
              />
            </div>
            <div>
              <label className="block mb-1">Door Transition Time (ms)</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={formData.timing.doorTransitionTimeMs}
                onChange={(e) => handleChange("timing", "doorTransitionTimeMs", e.target.value)}
                min={100}
              />
            </div>
            <div>
              <label className="block mb-1">Floor Travel Time (ms)</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={formData.timing.floorTravelTimeMs}
                onChange={(e) => handleChange("timing", "floorTravelTimeMs", e.target.value)}
                min={100}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Simulation Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Simulation Tick (ms)</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={formData.simulation.simulationTickMs}
                onChange={(e) => handleChange("simulation", "simulationTickMs", e.target.value)}
                min={10}
              />
            </div>
            <div>
              <label className="block mb-1">Simulation Speed Factor</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={formData.simulation.simulationSpeedFactor}
                onChange={(e) => handleChange("simulation", "simulationSpeedFactor", e.target.value)}
                min={0.1}
                step={0.1}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Apply Global Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default GlobalConfigPage;