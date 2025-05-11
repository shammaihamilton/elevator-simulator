import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ElevatorSystem } from '../types/interfaces';
import { RequestStatus } from '../types/enums/request.enums';
import dingSound from '../assets/ding.mp3';
import { motion } from 'framer-motion';
import './Floor.css';

interface FloorProps {
  floorNumber: number;
  onCallElevator: (floor: number, direction: "UP" | "DOWN", destinationFloor?: number) => void;
  systemState: ElevatorSystem;
  style?: CSSProperties;
  isLast?: boolean; // To know if this is the bottom floor (no separator)
}

const audioElement = new Audio(dingSound);

export default function Floor({ floorNumber, onCallElevator, systemState, style, isLast }: FloorProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<number | null>(null);
  const [callActive, setCallActive] = useState(false);

  // Track request status for this floor
  const requestStatus = (() => {
    // Check if there's an elevator at this floor with open doors
    const elevatorAtFloor = systemState.elevators.find(e => 
      e.currentFloor === floorNumber && 
      (e.doorState === "OPEN" || e.doorState === "OPENING")
    );

    // Check for requests in the pending queue
    const pendingRequest = systemState.pendingRequests.toArray().find(req =>
      req.sourceFloor === floorNumber &&
      (req.status === RequestStatus.PENDING_ASSIGNMENT || req.status === RequestStatus.WAITING_FOR_PICKUP)
    );

    // Check for passengers in transit
    const inTransitRequest = systemState.elevators.find(elevator =>
      elevator.passengers.some(p => 
        (p.sourceFloor === floorNumber || p.destinationFloor === floorNumber) && 
        p.status === RequestStatus.IN_TRANSIT
      )
    );

    // First priority: Show if an elevator is currently at this floor
    if (elevatorAtFloor) {
      return { type: 'SERVICING', elevatorId: elevatorAtFloor.id };
    }
    
    // Second priority: Show pending requests
    if (pendingRequest) {
      const assignedElevator = systemState.elevators.find(e => e.id === pendingRequest.assignedElevatorId);
      return { 
        type: pendingRequest.status === RequestStatus.PENDING_ASSIGNMENT ? 'PENDING' : 'ASSIGNED',
        requestId: pendingRequest.id,
        elevatorId: assignedElevator?.id
      };
    }
    
    // Third priority: Show in-transit status
    if (inTransitRequest) {
      return { 
        type: 'IN_TRANSIT', 
        elevatorId: inTransitRequest.id,
        isDestination: inTransitRequest.passengers.some(p => p.destinationFloor === floorNumber)
      };
    }

    return null;
  })();

  // Determine button state based on request status
  const buttonStyle = {
    position: 'absolute',
    left: '20px',
    width: '80px',
    height: '80px',
    fontSize: '2em',
    color: requestStatus ? 'limegreen' : undefined,
    transition: 'color 0.2s',
    zIndex: 2
  } as const;

  // Play sound and reset call button when elevator arrives
  useEffect(() => {
    const elevatorAtThisFloor = systemState.elevators.find(
      e => e.currentFloor === floorNumber && e.doorState === "OPEN"
    );
    if (elevatorAtThisFloor && callActive) {
      audioElement.play();
      setCallActive(false);
    }
  }, [systemState.elevators, floorNumber, callActive]);

  // Open dialog to select destination
  const handleOpenDialog = () => {
    setShowDialog(true);
    setSelectedDestination(null);
  };

  // Handle destination selection and call elevator
  const handleCall = () => {
    if (selectedDestination !== null && selectedDestination !== floorNumber) {
      const direction = selectedDestination > floorNumber ? "UP" : "DOWN";
      onCallElevator(floorNumber, direction, selectedDestination);
      setShowDialog(false);
      setCallActive(true);
    }
  };

  return (
    <div
      className="floor"
      style={{
        height: '110px',
        position: 'relative',
        ...style,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Floor call button */}
      <button
        className="metal linear"
        onClick={handleOpenDialog}
        style={buttonStyle}
      >
        {floorNumber}
      </button>

      {/* Show request status indicators */}
      {requestStatus && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            left: '120px',
            top: '20px',
            background: (() => {
              switch (requestStatus.type) {
                case 'PENDING': return '#ff9800';
                case 'ASSIGNED': return '#ffeb3b';
                case 'IN_TRANSIT': return requestStatus.isDestination ? '#2196F3' : '#4caf50';
                case 'SERVICING': return '#4caf50';
                default: return '#ffeb3b';
              }
            })(),
            color: requestStatus.type === 'PENDING' || requestStatus.type === 'ASSIGNED' ? '#333' : '#fff',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '0.9em',
            fontWeight: 600,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <span>
            {(() => {
              switch (requestStatus.type) {
                case 'PENDING': return 'Waiting for elevator...';
                case 'ASSIGNED': return requestStatus.elevatorId 
                  ? `Elevator #${requestStatus.elevatorId} en route` 
                  : 'Elevator assigned...';
                case 'IN_TRANSIT': return requestStatus.isDestination 
                  ? `Arriving on elevator #${requestStatus.elevatorId}` 
                  : `In elevator #${requestStatus.elevatorId}`;
                case 'SERVICING': return `Elevator #${requestStatus.elevatorId} arrived`;
                default: return 'Waiting...';
              }
            })()}
          </span>
          {'elevatorId' in requestStatus && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: requestStatus.type === 'SERVICING' ? '#fff' : '#333',
                opacity: 0.5
              }}
            />
          )}
        </motion.div>
      )}

      {/* Destination selection dialog */}
      {showDialog && (
        <div style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          width: '300px',
          border: '2px solid black',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: '1rem',
          zIndex: 1000
        }}>
          <div style={{ marginBottom: '0.5rem' }}>Select destination floor:</div>
          <select
            value={selectedDestination ?? ''}
            onChange={e => setSelectedDestination(Number(e.target.value))}
            style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
          >
            <option value="" disabled>Select floor</option>
            {Array.from({ length: systemState.config.numberOfFloors }).map((_, idx) => {
              const dest = idx;
              if (dest === floorNumber) return null;
              return (
                <option key={dest} value={dest}>{dest}</option>
              );
            })}
          </select>
          <div style={{ display: 'flex', gap: '0.5rem',  }}>
            <button onClick={handleCall} disabled={selectedDestination === null} style={{ padding: '0.5rem 1rem', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px' }}>Call</button>
            <button onClick={() => setShowDialog(false)} style={{ padding: '0.5rem 1rem', background: '#eee', border: 'none', borderRadius: '4px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Black separator line below, except for last floor */}
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '7px',
            background: 'black',
            zIndex: 1
          }}
        />
      )}
    </div>
  );
}