
import React from 'react';
import { motion } from 'framer-motion';
import { ElevatorDoorState } from '../types/enums';

interface ElevatorDoorProps {
  doorState: ElevatorDoorState;
  doorAnimationDuration: number; // Expecting duration in seconds
}

export const ElevatorDoor: React.FC<ElevatorDoorProps> = ({
  doorState,
  doorAnimationDuration
}) => {
  const isOpen = doorState === ElevatorDoorState.OPEN || doorState === ElevatorDoorState.OPENING;
  const isClosed = doorState === ElevatorDoorState.CLOSED || doorState === ElevatorDoorState.CLOSING;

  let targetWidth = '50%'; 
  if (isOpen) {
    targetWidth = '0%';
  } else if (isClosed) {
    targetWidth = '50%';
  }

  const animationDuration = Math.max(0.1, doorAnimationDuration);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        display: 'flex',
        pointerEvents: 'none',
        zIndex: 20 
      }}
    >
      {/* Left Door Panel */}
      <motion.div
        initial={false} 
        animate={{ width: targetWidth }}
        transition={{ duration: animationDuration, ease: "easeInOut" }}
        style={{
          height: '100%',
          backgroundColor: '#777', 
        }}
      />

      {/* Right Door Panel */}
      <motion.div
        initial={false}
        animate={{ width: targetWidth }}
        transition={{ duration: animationDuration, ease: "easeInOut" }}
        style={{
          height: '100%',
          backgroundColor: '#777', 
          position: 'absolute',
          right: 0, 
        }}
      />
    </div>
  );
};

export default ElevatorDoor;
