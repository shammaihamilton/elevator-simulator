
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import elvImg from "@/assets/elv.png"; 
import { ElevatorDoor } from "./ElevatorDoor";
import { ElevatorDoorState } from "@/types/enums";
import { IElevatorFSM } from "@/interfaces";
import dingSound from "@/assets/ding.mp3"; 

interface ElevatorProps {
  y: number;
  doorState: ElevatorDoorState;
  playDing: boolean;
  animationDuration: number;
  elevatorFSM: IElevatorFSM;
}

export const Elevator: React.FC<ElevatorProps> = ({
  y,
  doorState,
  playDing,
  animationDuration,
  elevatorFSM,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null); // Corrected ref type
  const prevYRef = useRef(y);

  // Ensure doorAnimationDuration is positive and sensible
  const doorAnimDur = Math.max(0.1, elevatorFSM.timing.doorTransitionTimeMs / 1000);


  // Effect to play the ding sound
  useEffect(() => {
    if (playDing && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((err) => console.warn(`[${elevatorFSM.id}] Ding failed to play:`, err));
    }
  }, [playDing, elevatorFSM.id]); 
  
// Effect to handle the elevator's Y position logging (for debugging)
  useEffect(() => {
    if (prevYRef.current !== y) {

      prevYRef.current = y;
    }
  }, [y, elevatorFSM.id, elevatorFSM.currentFloor]);

  return (
    <>
      <motion.div
        initial={false} 
        animate={{ y: y }}
        transition={{
          duration: animationDuration > 0 ? animationDuration : 0.1, // Ensure duration is positive
          ease: "linear",
     
        }}
        style={{
          position: "absolute",
          left: "4px",
          width: "70px",
          height: "70px",
          display: "flex",
          border: "2px solid #555",
          alignItems: "center",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          borderRadius: "5px",
          overflow: "hidden", 
          flexDirection: "column",
          zIndex: 10, 
        }}
      >
        {/* Cabin Visuals */}
        <div
          className="elevator-cabin-visuals"
          style={{
            width: "100%", 
            height: "100%", 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative", 
            overflow: "hidden", 
          }}
        >
          <img
            src={elvImg}
            alt={`Elevator ${elevatorFSM.id.slice(-1)}`}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover", 
            }}
          />

          {/* Floor Display */}
          <div
            style={{
              position: "absolute",
              top: "2px", 
              left: "50%",
              transform: "translateX(-50%)", 
              padding: "1px 4px",
              fontSize: "14px", 
              fontWeight: "bold",
              color: "white",
              backgroundColor: "rgba(0,0,0,0.6)", 
              zIndex: 15, 
              borderRadius: "3px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              minWidth: "20px",
            }}
          >
            {elevatorFSM.currentFloor}
          </div>
        </div>

        {/* Doors - Rendered on top of cabin visuals */}
        <ElevatorDoor
          doorState={doorState}
          doorAnimationDuration={doorAnimDur}
        />

      </motion.div>
      <audio
        ref={audioRef} 
        src={dingSound}
        preload="auto"
        loop={false}
        style={{ display: "none" }} 
      />
    </>
  );
};

export default Elevator;
