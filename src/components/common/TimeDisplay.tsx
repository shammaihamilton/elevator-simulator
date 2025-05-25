// src/components/TimeDisplay.tsx
import React from "react";

interface TimeDisplayProps {
  milliseconds: number;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ milliseconds }) => {
  const totalMs = Math.max(0, milliseconds);
  const totalSeconds = Math.floor(totalMs / 1000);
  const msTwoDigits = Math.floor((totalMs % 1000) / 10)
    .toString()
    .padStart(1, "0");

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Build parts
  const hh = hours.toString();
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  let time: string;
  if (hours > 0) {
    // H:MM:SS.xx
    time = `${hh}:${mm}:${ss}.${msTwoDigits}`;
  } else if (minutes > 0) {
    // M:SS.xx (no leading zero on minutes)
    time = `${minutes}:${ss}.${msTwoDigits}`;
  } else {
    // S.xx  (seconds without leading zero, milliseconds two digits)
    time = `${seconds}.${msTwoDigits}`;
    // time = `${ss}`;
  } 

  return (
  <span
    style={{
      display: "inline-block",
      // fontFamily: "monospace", // fixed-width font
      textAlign: "center",
      minWidth: "50px", 
      maxWidth: "55px",
      padding: "5px 8px",
      color: "black",
      fontWeight: "500",
      backgroundColor: "lightgray",
      borderRadius: "4px",
      height: "20px",
    }}
  >
    {time}
  </span>
);
};

export default TimeDisplay;
