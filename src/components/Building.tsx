// src/components/Building.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Floor from './Floor';
import { Elevator } from './Elevator';
import type { BuildingConfig, ElevatorSystem } from '../types/interfaces';
import { SimulationLoop } from '../core/SimulationLoop';

const FLOOR_HEIGHT = 110; // px per floor, matches Floor component height + separator

interface BuildingProps {
  config: BuildingConfig;
}

const Building: React.FC<BuildingProps> = ({ config }) => {
  const [simulation] = useState(() => SimulationLoop.getInstance(config));
  const [systemState, setSystemState] = useState<ElevatorSystem>(simulation.getSystemState());
  const lastUpdateTimeRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const buildingRef = useRef<HTMLDivElement>(null);

  // Reset simulation when component unmounts
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      SimulationLoop.resetInstance();
    };
  }, []);

  // Start simulation loop and update state
  useEffect(() => {
    let mounted = true;
    simulation.start();
    
    // Calculate an appropriate update interval
    // We want it to be frequent enough for smooth animation but not too frequent to cause performance issues
    const updateInterval = Math.min(16, (config.simulationTickMs ?? 100) / 3);

    const updateState = (timestamp: number) => {
      if (!mounted) return;

      // Only update state if enough time has passed
      if (timestamp - lastUpdateTimeRef.current >= updateInterval) {
        const newState = simulation.getSystemState();
        
        setSystemState(prevState => {
          // Check if we need to update the state by comparing key properties
          const elevatorChanged = newState.elevators.some((elevator, index) => {
            const prevElevator = prevState.elevators[index];
            if (!prevElevator) return true;
            
            return (
              elevator.currentFloor !== prevElevator.currentFloor ||
              elevator.state !== prevElevator.state ||
              elevator.doorState !== prevElevator.doorState ||
              elevator.direction !== prevElevator.direction ||
              elevator.passengers.length !== prevElevator.passengers.length
            );
          });

          // Fix: Access size as a property, not a method
          const requestsChanged = 
            newState.pendingRequests.size !== prevState.pendingRequests.size;

          return (elevatorChanged || requestsChanged) ? newState : prevState;
        });
        
        lastUpdateTimeRef.current = timestamp;
      }
      
      animationFrameIdRef.current = requestAnimationFrame(updateState);
    };

    animationFrameIdRef.current = requestAnimationFrame(updateState);

    return () => {
      mounted = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [simulation, config.simulationTickMs]);

  // Handle user clicking a floor call
  const handleFloorCall = useCallback(
    (floor: number, direction: 'UP' | 'DOWN', destinationFloor?: number) => {
      if (destinationFloor !== undefined) {
        simulation.addPassengerRequest(floor, destinationFloor, direction);
      }
    },
    [simulation]
  );

  // Handle internal elevator panel requests
  const handleElevatorInternalRequest = useCallback(
    (elevatorId: string, destinationFloor: number) => {
      simulation.addElevatorPanelRequest(elevatorId, destinationFloor);
    },
    [simulation]
  );

  return (
    <div
      ref={buildingRef}
      className="building-container"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: `${config.numberOfFloors * FLOOR_HEIGHT}px`,
        border: '2px solid #333',
        borderRadius: '8px',
        backgroundColor: '#f0f0f0',
        position: 'relative',
        overflow: 'hidden',
        padding: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        margin: '20px auto'
      }}
    >
      {/* Floor column */}
      <div
        className="floor-column"
        style={{
          display: 'flex',
          flexDirection: 'column-reverse',
          height: '100%',
          borderRight: '2px solid #999',
          paddingRight: '10px',
          background: 'repeating-linear-gradient(0deg, #e0e0e0, #e0e0e0 5px, #d0d0d0 5px, #d0d0d0 10px)',
        }}
      >
        {Array.from({ length: config.numberOfFloors }).map((_, idx) => {
          const isLast = idx === 0; // Is this the bottom floor?
          return (
            <Floor
              key={idx}
              floorNumber={idx}
              onCallElevator={handleFloorCall}
              systemState={systemState}
              isLast={isLast}
              style={{
                height: `${FLOOR_HEIGHT}px`,
                width: '160px',
                position: 'relative',
                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
              }}
            />
          );
        })}
      </div>

      {/* Elevator shafts */}
      <div
        className="elevator-shafts"
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          gap: '30px',
          paddingLeft: '20px',
          flex: 1,
          position: 'relative',
        }}
      >
        {/* Shaft backgrounds */}
        {Array.from({ length: systemState.elevators.length }).map((_, index) => (
          <div 
            key={`shaft-${index}`}
            className="elevator-shaft"
            style={{
              position: 'relative',
              width: '70px',
              height: '100%',
              backgroundColor: '#333',
              borderRadius: '4px',
              padding: '5px',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Floor markings within shaft */}
            {Array.from({ length: config.numberOfFloors }).map((_, floorIdx) => (
              <div
                key={`floor-marking-${floorIdx}`}
                style={{
                  position: 'absolute',
                  bottom: `${floorIdx * FLOOR_HEIGHT + FLOOR_HEIGHT / 2}px`,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }}
              />
            ))}
            
            {/* Floor numbers within shaft */}
            {Array.from({ length: config.numberOfFloors }).map((_, floorIdx) => (
              <div
                key={`floor-number-${floorIdx}`}
                style={{
                  position: 'absolute',
                  bottom: `${floorIdx * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 - 10}px`,
                  right: '5px',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {floorIdx}
              </div>
            ))}
          </div>
        ))}

        {/* Actual elevator cars */}
        {systemState.elevators.map((elevator, index) => (
          <Elevator
            key={elevator.id}
            elevator={elevator}
            totalFloorsInBuilding={config.numberOfFloors}
            floorHeight={FLOOR_HEIGHT}
            onInternalRequest={handleElevatorInternalRequest}
            elevatorPosition={{
              position: 'absolute',
              bottom: `${(config.numberOfFloors - elevator.currentFloor - 1) * FLOOR_HEIGHT}px`, 
              left: `${20 + index * 100}px`, 
              width: '80px', 
              zIndex: 10  
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Building;