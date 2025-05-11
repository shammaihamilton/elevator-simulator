import { useState } from 'react';
import type { BuildingConfig } from '../types/interfaces';
import { DispatchStrategy } from '../types/enums';

interface ConfigurationDialogProps {
  initialConfig?: BuildingConfig;
  onSave: (config: BuildingConfig) => void;
  onCancel: () => void;
}

export default function ConfigurationDialog({ initialConfig, onSave, onCancel }: ConfigurationDialogProps) {
  const [config, setConfig] = useState<BuildingConfig>(() => initialConfig || {
    numberOfFloors: 11,
    numberOfElevators: 3,
    elevatorCapacity: 8,
    doorOpenTimeMs: 3000,
    doorTransitionTimeMs: 1500,
    floorTravelTimeMs: 2000,
    dispatchStrategy: DispatchStrategy.CLOSEST_CABIN,
    simulationTickMs: 100
  });

  const handleChange = (field: keyof BuildingConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: typeof prev[field] === 'number' ? Number(value) : value
    }));
  };

  return (
    <div className="dialog-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="dialog-content" style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '90%',
        maxWidth: '500px'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Elevator System Configuration</h2>
        
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Number of Floors:</label>
            <input
              type="number"
              value={config.numberOfFloors}
              onChange={e => handleChange('numberOfFloors', e.target.value)}
              min="2"
              max="100"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Number of Elevators:</label>
            <input
              type="number"
              value={config.numberOfElevators}
              onChange={e => handleChange('numberOfElevators', e.target.value)}
              min="1"
              max="10"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Elevator Capacity:</label>
            <input
              type="number"
              value={config.elevatorCapacity}
              onChange={e => handleChange('elevatorCapacity', e.target.value)}
              min="1"
              max="20"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Door Open Time (ms):</label>
            <input
              type="number"
              value={config.doorOpenTimeMs}
              onChange={e => handleChange('doorOpenTimeMs', e.target.value)}
              min="500"
              max="10000"
              step="100"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Door Transition Time (ms):</label>
            <input
              type="number"
              value={config.doorTransitionTimeMs}
              onChange={e => handleChange('doorTransitionTimeMs', e.target.value)}
              min="500"
              max="5000"
              step="100"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Floor Travel Time (ms):</label>
            <input
              type="number"
              value={config.floorTravelTimeMs}
              onChange={e => handleChange('floorTravelTimeMs', e.target.value)}
              min="500"
              max="10000"
              step="100"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Dispatch Strategy:</label>
            <select
              value={config.dispatchStrategy}
              onChange={e => handleChange('dispatchStrategy', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={DispatchStrategy.CLOSEST_CABIN}>Closest Cabin</option>
              <option value={DispatchStrategy.LEAST_STOPS}>Least Stops</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Simulation Tick (ms):</label>
            <input
              type="number"
              value={config.simulationTickMs}
              onChange={e => handleChange('simulationTickMs', e.target.value)}
              min="50"
              max="1000"
              step="50"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(config)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              background: '#0066cc',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
