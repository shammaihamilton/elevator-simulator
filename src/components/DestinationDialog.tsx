// src/components/DestinationDialog.tsx
import React, { useState, useEffect } from 'react';

interface DestinationDialogProps {
  isOpen: boolean;
  sourceFloor: number;
  numberOfFloors: number;
  onSelectDestination: (destinationFloor: number) => void;
  onClose: () => void;
}

export const DestinationDialog: React.FC<DestinationDialogProps> = ({
  isOpen,
  sourceFloor,
  numberOfFloors,
  onSelectDestination,
  onClose,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<number | null>(null);

  useEffect(() => {
    // Reset selection when dialog opens for a new source floor
    if (isOpen) {
      // Set a default different from sourceFloor if possible
      if (sourceFloor === 0 && numberOfFloors > 1) {
        setSelectedDestination(1);
      } else if (sourceFloor > 0) {
        setSelectedDestination(0);
      } else if (numberOfFloors > 1) { // Only one floor, but dialog opened
        setSelectedDestination(null); // No valid destination
      } else {
        setSelectedDestination(null);
      }
    }
  }, [isOpen, sourceFloor, numberOfFloors]);

  if (!isOpen) {
    return null;
  }

  const handleFloorSelect = (floor: number) => {
    setSelectedDestination(floor);
  };

  const handleSubmit = () => {
    if (selectedDestination !== null) {
      onSelectDestination(selectedDestination);
    }
    onClose();
  };

  const floorOptions = Array.from({ length: numberOfFloors }, (_, i) => i)
                            .filter(floor => floor !== sourceFloor);

  return (
    <div className="configuration-dialog-overlay"> {/* Re-use dialog overlay style */}
      <div className="configuration-dialog" style={{ maxWidth: '350px' }}> {/* Re-use dialog style */}
        <h2>Select Destination Floor</h2>
        <p>Calling from Floor: {sourceFloor}</p>
        <div style={{ margin: '20px 0', maxHeight: '200px', overflowY: 'auto' }}>
          {floorOptions.length > 0 ? (
            floorOptions.map((floor) => (
              <button
                key={floor}
                className={`metal linear ${selectedDestination === floor ? 'selected-destination' : ''}`}
                onClick={() => handleFloorSelect(floor)}
                style={{
                  display: 'block',
                  width: '100%',
                  margin: '5px 0',
                  padding: '10px',
                  fontSize: '1em',
                  // Add a style for 'selected-destination' in your CSS
                  // e.g., backgroundColor: 'lightgreen'
                }}
              >
                Floor {floor}
              </button>
            ))
          ) : (
            <p>No other floors available to select.</p>
          )}
        </div>
        <div className="dialog-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedDestination === null || floorOptions.length === 0}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};