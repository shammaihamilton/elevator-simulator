import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ElevatorState, ElevatorDoorState } from '../types/enums';
import type { Elevator as ElevatorType } from '../types/interfaces';
import './Elevator.css';
import elvPngPath from '../assets/elv.png'; // Assuming this path is correct

interface ElevatorProps {
  elevator: ElevatorType;
  floorHeight: number;
  onInternalRequest?: (elevatorId: string, destinationFloor: number) => void;
  totalFloors?: number; // Optional: for internal floor buttons
  elevatorPosition?: React.CSSProperties;
  totalFloorsInBuilding: number; // Add this prop
}

export const Elevator: React.FC<ElevatorProps> = ({
  elevator,
  floorHeight,
  // onInternalRequest, // Kept commented as per your code
  totalFloorsInBuilding,
  elevatorPosition,
}) => {
  const {
    id,
    currentFloor,
    state,
    doorState,
    passengers = [],
    capacity,
  } = elevator;
  
  const yPosition = (totalFloorsInBuilding - 1 - currentFloor) * floorHeight;
  const isMoving = state === ElevatorState.MOVING_UP || state === ElevatorState.MOVING_DOWN;
  const targetDoorOpenState =
    doorState === ElevatorDoorState.OPEN || doorState === ElevatorDoorState.OPENING;
  const isDoorMoving =
    doorState === ElevatorDoorState.OPENING || doorState === ElevatorDoorState.CLOSING;
  
  useEffect(() => {
    // This effect runs when 'state', 'currentFloor', or 'id' changes.
    if (state === ElevatorState.MOVING_UP || state === ElevatorState.MOVING_DOWN) {


      // Log the elevator's state and current floor when it starts moving.

      
      // This will log when the elevator is in a moving state.
      // Note: 'currentFloor' in this log might reflect the floor it *arrived at*
      // if the state updates to IDLE just after reaching the currentFloor.
      // If you want to log the *destination* when it starts moving,
      // you might need to access that from the elevator object if available.
      console.log(`Elevator ${id} is moving. Current floor: ${currentFloor}, State: ${state}`);
    }
    if (state === ElevatorState.IDLE) {
      console.log(`Elevator ${id} is idle at floor ${currentFloor}`);
    }
  }, [state, currentFloor, id, doorState]); // Added doorState to dependency array for completeness if you use it

  const loadPercentage = capacity > 0 ? (passengers.length / capacity) * 100 : 0;


  return (
    <motion.div
      className="elevator"
      initial={false}
      animate={{
        y: yPosition,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        mass: 1,
      }}
      style={elevatorPosition}
    >
      <div className="elevator-shaft">
        <div
          className={`elevator-car ${isMoving ? 'moving' : ''} ${targetDoorOpenState ? 'open' : ''}`}
          style={{ backgroundImage: `url(${elvPngPath})` }}
        >
          <div className="elevator-interior">
            <div className="elevator-info">
              <div className="elevator-id">Elevator: {id}</div>
              <div className="current-floor-display">Floor: {currentFloor}</div>
              <div className="elevator-status">
                <span className="direction-indicator">
                  {state === ElevatorState.MOVING_UP
                    ? '▲'
                    : state === ElevatorState.MOVING_DOWN
                    ? '▼'
                    : '•'}
                </span>
                <span> {state}</span>
                {isDoorMoving && <span> ({doorState})</span>}
              </div>
              <div className={`load-indicator ${
                loadPercentage < 50 ? 'low' : loadPercentage < 85 ? 'medium' : 'high'
              }`}>
                Load: {passengers.length}/{capacity} ({loadPercentage.toFixed(0)}%)
              </div>

              <div className="elevator-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="elevator-svg-icon"
                >
                  <path d="M12 2a2 2 0 00-2 2v1H8a2 2 0 00-2 2v1H4a2 2 0 00-2 2v1h1v10a2 2 0 002 2h16a2 2 0 002-2V8h1V7a2 2 0 00-2-2h-1V4a2 2 0 00-2-2h-1V1a2 2 0 00-4 0v1H8V1a2 2 0 00-4 0v1H4zm6.5-.5A.5.5 0 0113.5.5h-3A.5.5 0 0111 .5h6zM4.5.5A.5.5 0 014 .5h3A.5.5 0 017 .5H4z" />
                </svg>
              </div>
            </div>
            {/* Internal button panel remains commented out */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};