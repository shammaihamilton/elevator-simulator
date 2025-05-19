
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import elvImg from "../assets/elv.png"; // Assuming this path is correct relative to src
import { ElevatorDoor } from "./ElevatorDoor";
import { ElevatorDoorState } from "../types/enums";
import { IElevatorFSM } from "@/interfaces";
import dingSound from "../assets/ding.mp3"; // Assuming this path is correct

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
  }, [playDing, elevatorFSM.id]); // Added elevatorFSM.id for context in logs

// Effect to handle the elevator's Y position logging (for debugging)
  useEffect(() => {
    if (prevYRef.current !== y) {
      // console.log(
      //   `Elevator ${elevatorFSM.id} moving to Y: ${y}, Floor: ${elevatorFSM.currentFloor}`
      // );
      prevYRef.current = y;
    }
  }, [y, elevatorFSM.id, elevatorFSM.currentFloor]);

  return (
    <>
      <motion.div
        initial={false} // Avoid initial animation from 0,0 if y is already set
        animate={{ y: y }}
        transition={{
          duration: animationDuration > 0 ? animationDuration : 0.1, // Ensure duration is positive
          ease: "linear",
          // onComplete: () => { // onComplete can be useful for FSM updates if needed
          //   console.log(
          //     `Elevator ${elevatorFSM.id} completed animation to Y: ${y}`
          //   );
          // },
        }}
        style={{
          // margin: "20px", // Margin might be better on the parent positioning div
          position: "absolute",
          left: "0px", // Positioned by parent
          width: "70px",
          height: "70px",
          // backgroundColor: "#333", // Image will cover this
          display: "flex",
          // justifyContent: "space-between", // Not needed with current layout
          border: "2px solid #555",
          alignItems: "center",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          borderRadius: "5px",
          overflow: "hidden", // Important for door animations
          flexDirection: "column", // For internal layout if any
          zIndex: 10, // Ensure elevator is above floors if overlapping
        }}
      >
        {/* Cabin Visuals */}
        <div
          className="elevator-cabin-visuals"
          style={{
            width: "100%", // Take full width of motion.div
            height: "100%", // Take full height of motion.div
            // backgroundColor: "white", // Covered by image
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative", // For absolute positioning of children like display
            overflow: "hidden", // Ensure image fits
          }}
        >
          <img
            src={elvImg}
            alt={`Elevator ${elevatorFSM.id.slice(-1)}`}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover", // Ensure image covers the area
            }}
          />

          {/* Floor Display */}
          <div
            style={{
              position: "absolute",
              top: "2px", // Adjusted for better visibility
              left: "50%",
              transform: "translateX(-50%)", // Center the display
              padding: "1px 4px",
              fontSize: "14px", // Slightly smaller for better fit
              fontWeight: "bold",
              color: "white",
              backgroundColor: "rgba(0,0,0,0.6)", // Background for readability
              zIndex: 15, // Above image, below doors if they were to overlap text
              borderRadius: "3px",
              // width: "25px", // Let content define width
              // height: "25px", // Let content define height
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              minWidth: "20px", // Ensure it's visible even for single digit
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
        ref={audioRef} // Corrected ref assignment
        src={dingSound}
        preload="auto"
        loop={false}
        style={{ display: "none" }} // Keep hidden
      />
    </>
  );
};

export default Elevator;
