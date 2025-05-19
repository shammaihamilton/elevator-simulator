import React, { useCallback, useEffect, useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";

interface BuildingConfigDialogProps {
  buildingIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_BUILDING_PARAMS = {
  floorsPerBuilding: 8,
  elevatorsPerBuilding: 1,
  initialElevatorFloor: 0,
};
const DEFAULT_TIMING_PARAMS = {
  doorOpenTimeMs: 3000,
  doorTransitionTimeMs: 500,
  floorTravelTimeMs: 1000,
  delayPerFloorMs: 200,
};

type BuildingFormData = {
  floorsPerBuilding: number;
  elevatorsPerBuilding: number;
  initialElevatorFloor: number;
  doorOpenTimeMs: number;
  doorTransitionTimeMs: number;
  floorTravelTimeMs: number;
  delayPerFloorMs: number;
};

const BuildingConfigDialog: React.FC<BuildingConfigDialogProps> = ({
  buildingIndex,
  isOpen,
  onClose,
}) => {
//   const allSettings = useSimulationStore((state) => state.settings);
  const globalSettings = useSimulationStore((state) => state.settings)
  const updateBuildingSettings = useSimulationStore((state) => state.updateBuildingSettings);
   const specificBuildingSettings = useSimulationStore((state) => 
    state.buildingSpecificSettings?.[buildingIndex] || null
  );
  
  // Merge global settings with building-specific settings (if any)
  const getEffectiveSettings = useCallback((): BuildingFormData => {
    const gBuildings = globalSettings.buildings || DEFAULT_BUILDING_PARAMS;
    const gTiming = globalSettings.timing || DEFAULT_TIMING_PARAMS;
    
    return {
        floorsPerBuilding: gBuildings.floorsPerBuilding,
        elevatorsPerBuilding: gBuildings.elevatorsPerBuilding,
        initialElevatorFloor: gBuildings.initialElevatorFloor,
        doorOpenTimeMs: gTiming.doorOpenTimeMs,
        doorTransitionTimeMs: gTiming.doorTransitionTimeMs,
        floorTravelTimeMs: gTiming.floorTravelTimeMs,
        delayPerFloorMs: gTiming.delayPerFloorMs,
        ...(specificBuildingSettings || {}), // Apply specific settings, overriding globals
    };
}, [globalSettings, specificBuildingSettings]);

const [formData, setFormData] = useState<BuildingFormData>(getEffectiveSettings());

  useEffect(() => {
    if (isOpen) {
      setFormData(getEffectiveSettings());
    }
  }, [isOpen, getEffectiveSettings]);

  const handleChange = (field: keyof BuildingFormData, value: string) => {
    const numValue = Number(value);
    setFormData({
    ...formData,
    [field]: !isNaN(numValue) ? numValue : (value === "" && typeof formData[field] === 'number' ? 0 : formData[field]),
  });
  };
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBuildingSettings(buildingIndex, formData);
    onClose();
  };
  

  const handleResetToGlobal = () => {
    updateBuildingSettings(buildingIndex, null);
    onClose();
 }    
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Building {buildingIndex + 1} Configuration</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Building Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Floors</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={formData.floorsPerBuilding}
                  onChange={(e) => handleChange("floorsPerBuilding", e.target.value)}
                  min={2}
                />
              </div>
              <div>
                <label className="block mb-1">Elevators</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={formData.elevatorsPerBuilding}
                  onChange={(e) => handleChange("elevatorsPerBuilding", e.target.value)}
                  min={1}
                />
              </div>
              <div>
                <label className="block mb-1">Initial Elevator Floor</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={formData.initialElevatorFloor}
                  onChange={(e) => handleChange("initialElevatorFloor", e.target.value)}
                  min={0}
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Timing Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Door Open Time (ms)</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={formData.doorOpenTimeMs}
                  onChange={(e) => handleChange("doorOpenTimeMs", e.target.value)}
                  min={100}
                />
              </div>
              <div>
                <label className="block mb-1">Delay per Floor (ms)</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={formData.delayPerFloorMs}
                  onChange={(e) => handleChange("delayPerFloorMs", e.target.value)}
                  min={100}
                />
              </div>
              <div>
                <label className="block mb-1">Door Transition (ms)</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={formData.doorTransitionTimeMs}
                  onChange={(e) => handleChange("doorTransitionTimeMs", e.target.value)}
                  min={100}
                />
              </div>
              <div>
                <label className="block mb-1">Floor Travel Time (ms)</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={formData.floorTravelTimeMs}
                  onChange={(e) => handleChange("floorTravelTimeMs", e.target.value)}
                  min={100}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              onClick={handleResetToGlobal}
            >
              Reset to Global Settings
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Apply Building Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




export default BuildingConfigDialog;