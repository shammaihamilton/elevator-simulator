import React, { useState, useEffect, FormEvent } from "react";
import { useSimulationStore } from "@store/simulationStore";
import {
  AppSettings,
  ElevatorTimingSettings,
  SimulationSettings,
  BuildingSettings,
} from "@/interfaces";
import formatTime from "@/utils/formatTime";
const inputStyle: React.CSSProperties = {
  margin: "5px 0",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  width: "calc(100% - 18px)", // Adjust for padding and border
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "2px",
  fontWeight: "bold",
};

const fieldsetStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "15px",
  margin: "10px 0",
  borderRadius: "5px",
};

const legendStyle: React.CSSProperties = {
  fontWeight: "bold",
  padding: "0 5px",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 15px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginTop: "10px",
};

export const SimulationControls: React.FC = ( ) => {
  const { currentTime, settings, updateSettings } = useSimulationStore();

  // Local state for form inputs, initialized from the store
  const [localTimingSettings, setLocalTimingSettings] =
    useState<ElevatorTimingSettings>(settings.timing);
  const [lacalbuilingSettings, setLocalBuildingSettings] =
    useState<BuildingSettings>(settings.buildings);
  const [localSimulationSettings, setLocalSimulationSettings] =
    useState<SimulationSettings>(settings.simulation);

  // Effect to update local state if store settings change (e.g., on reset)
  useEffect(() => {
    setLocalTimingSettings(settings.timing);
    setLocalSimulationSettings(settings.simulation);
    setLocalBuildingSettings(settings.buildings);
  }, [settings]);

  const handleTimingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalTimingSettings((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSimulationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSimulationSettings((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleBuildingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalBuildingSettings((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newSettings: Partial<AppSettings> = {
      timing: localTimingSettings,
      simulation: localSimulationSettings,
      buildings: lacalbuilingSettings,
    };
    updateSettings(newSettings);
    alert("Settings updated!");
  };


  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "400px",
        margin: "20px auto",
        border: "1px solid #eee",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Simulation Controls</h2>
      <p>
        <strong>Current Simulation Time:</strong> {formatTime(currentTime)}
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Elevator Timing (ms)</legend>
          <div>
            <label htmlFor="doorOpenTimeMs" style={labelStyle}>
              Door Open Time:
            </label>
            <input
              type="number"
              id="doorOpenTimeMs"
              name="doorOpenTimeMs"
              value={localTimingSettings.doorOpenTimeMs}
              onChange={handleTimingChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="timePerFloorMs" style={labelStyle}>
              Time Per Floor (Movement):
            </label>
            <input
              type="number"
              id="timePerFloorMs"
              name="timePerFloorMs"
              value={localTimingSettings.floorTravelTimeMs}
              onChange={handleTimingChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="delayPerFloorMs" style={labelStyle}>
              Delay Per Floor (Stop):
            </label>
            <input
              type="number"
              id="delayPerFloorMs"
              name="delayPerFloorMs"
              value={localTimingSettings.delayPerFloorMs}
              onChange={handleTimingChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="doorTransitionTimeMs" style={labelStyle}>
              Door Transition Time:
            </label>
            <input
              type="number"
              id="doorTransitionTimeMs"
              name="doorTransitionTimeMs"
              value={localTimingSettings.doorTransitionTimeMs}
              onChange={handleTimingChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="floorTravelTimeMs" style={labelStyle}>
              Floor Travel Time (Animation):
            </label>
            <input
              type="number"
              id="floorTravelTimeMs"
              name="floorTravelTimeMs"
              value={localTimingSettings.floorTravelTimeMs}
              onChange={handleTimingChange}
              style={inputStyle}
            />
          </div>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Building Settings</legend>
          <div>
            <label htmlFor="buildings" style={labelStyle}>
              Number of Buildings:
            </label>
            <input
              type="number"
              id="buildings"
              name="buildings"
              value={lacalbuilingSettings.buildings}
              onChange={handleBuildingChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="floorsPerBuilding" style={labelStyle}>
              Floors Per Building:
            </label>
            <input
              type="number"
              id="floorsPerBuilding"
              name="floorsPerBuilding"
              value={lacalbuilingSettings.floorsPerBuilding}
              onChange={handleBuildingChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="elevatorsPerBuilding" style={labelStyle}>
              Elevators Per Building:
            </label>
            <input
              type="number"
              id="elevatorsPerBuilding"
              name="elevatorsPerBuilding"
              value={lacalbuilingSettings.elevatorsPerBuilding}
              onChange={handleBuildingChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="initialElevatorFloor" style={labelStyle}>
              Initial Elevator Floor:
            </label>
            <input
              type="number"
              id="initialElevatorFloor"
              name="initialElevatorFloor"
              value={lacalbuilingSettings.initialElevatorFloor}
              onChange={handleBuildingChange}
              style={inputStyle}
            />
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Simulation Settings</legend>
          <div>
            <label htmlFor="simulationTickMs" style={labelStyle}>
              Simulation Tick (ms):
            </label>
            <input
              type="number"
              id="simulationTickMs"
              name="simulationTickMs"
              value={localSimulationSettings.simulationTickMs}
              onChange={handleSimulationChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="simulationSpeedFactor" style={labelStyle}>
              Simulation Speed Factor:
            </label>
            <input
              type="number"
              id="simulationSpeedFactor"
              name="simulationSpeedFactor"
              step="0.1"
              value={localSimulationSettings.simulationSpeedFactor}
              onChange={handleSimulationChange}
              style={inputStyle}
            />
          </div>
        </fieldset>

        <button type="submit" style={buttonStyle}>
          Apply Settings
        </button>
      </form>
    </div>
  );
};
