import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import elvImg from "../assets/elv.png";
import { ElevatorDoor } from "./ElevatorDoor";
import { ElevatorDoorState } from "../types/enums";
import { IElevatorFSM } from "@/types/interfaces";
import dingSound from "../assets/ding.mp3";

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
  const audioRef = useRef<HTMLAudioElement | null>();
  const prevYRef = useRef(y);

  const doorAnimationDuration = elevatorFSM.timing.doorOpenTimeMs / 1000; // Convert to seconds


  // Effect to play the ding sound
  useEffect(() => {
    if (playDing && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((err) => console.warn("Ding failed to play:", err));
    }
  }, [playDing]);

// Effect to handle the elevator's Y position
  useEffect(() => {
    if (prevYRef.current !== y) {
      console.log(
        `Elevator ${elevatorFSM.id} moving to Y: ${y}, Floor: ${elevatorFSM.currentFloor}`
      );
      prevYRef.current = y;
    }
  }, [y, elevatorFSM.id, elevatorFSM.currentFloor]);

  return (
    <>
      <motion.div
        initial={false}
        animate={{ y: y }}
        transition={{
          duration: animationDuration,
          ease: "linear",
          onComplete: () => {
            console.log(
              `Elevator ${elevatorFSM.id} completed animation to Y: ${y}`
            );
          },
        }}
        style={{
          margin: "20px",
          position: "absolute",
          left: "0px",
          width: "70px",
          height: "70px",
          backgroundColor: "#333",
          display: "flex",
          justifyContent: "space-between",
          border: "2px solid #555",
          alignItems: "center",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          borderRadius: "5px",
          overflow: "hidden",
          flexDirection: "column",

          zIndex: 10,
        }}
      >
        <div
          className="elevator-cabin"
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src={elvImg}
            alt="Elevator"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "5px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "lightgreen",
              zIndex: 5,
              borderRadius: "50%",
              width: "25px",
              height: "25px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {elevatorFSM.currentFloor}
          </div>
        </div>
        <ElevatorDoor
          doorState={doorState}
          doorAnimationDuration={doorAnimationDuration}
        />

      </motion.div>
      <audio
        ref={(el) => (audioRef.current = el)}
        src={dingSound}
        preload="auto"
        loop={false}
        style={{ display: "none" }}
      />
    </>
  );
};

export default Elevator;
