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
    .padStart(2, "0");

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Build parts
  const hh = hours.toString();
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  let label: string;
  if (hours > 0) {
    // H:MM:SS.xx
    label = `${hh}:${mm}:${ss}.${msTwoDigits}`;
  } else if (minutes > 0) {
    // M:SS.xx (no leading zero on minutes)
    label = `${minutes}:${ss}.${msTwoDigits}`;
  } else {
    // S.xx  (seconds without leading zero, milliseconds two digits)
    label = `${seconds}.${msTwoDigits}`;
  }

  return <span>{label}</span>;
};

export default TimeDisplay;
