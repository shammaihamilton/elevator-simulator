// ElevatorDoor.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ElevatorDoorState } from '../types/enums';

interface ElevatorDoorProps {
  doorState: ElevatorDoorState;
  doorAnimationDuration: number;
}

export const ElevatorDoor: React.FC<ElevatorDoorProps> = ({ 
  doorState, 
  doorAnimationDuration 
}) => {
  const isOpen = doorState === 'OPEN';

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        pointerEvents: 'none',
        zIndex: 10 
      }}
    >
      <motion.div
        animate={{ width: isOpen ? '0%' : '50%' }}
        transition={{ duration: doorAnimationDuration / 10 }}
        style={{ 
          height: '100%', 
          backgroundColor: '#777',
          transformOrigin: 'left' 
        }}
      />
      
      <motion.div
        animate={{ width: isOpen ? '0%' : '50%' }}
        transition={{ duration: doorAnimationDuration / 10 }}
        style={{ 
          height: '100%', 
          backgroundColor: '#777',
          transformOrigin: 'right' 
        }}
      />
    </div>
  );
};

export default ElevatorDoor;