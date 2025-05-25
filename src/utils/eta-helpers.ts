

// core/eta-helpers.ts
import { ElevatorState } from '../types/enums';
import { PassengerRequest } from '../interfaces';
import { ElevatorTimingSettings, IElevatorTimingManager } from '../interfaces';


export interface ETACalcParams {
  currentFloor: number;
  currentTime: number;
  targetFloor: number;
  queue: PassengerRequest[];
  timing: ElevatorTimingSettings;
  state: ElevatorState;
  timingManager: IElevatorTimingManager;
}

interface Projection { time: number; floor: number; }
interface Segment { from: number; to: number; stop: boolean; }

/* ───────── cached math helpers ───────── */

export function fullStopMs(t: ElevatorTimingSettings) {
  const {  doorOpenTimeMs, delayPerFloorMs } = t;
  return  Math.max(doorOpenTimeMs, delayPerFloorMs) 
  
}
 
const travelMs = (floor1: number, floor2: number, t: ElevatorTimingSettings) =>
  Math.abs(floor1 - floor2) * t.floorTravelTimeMs 




const segMs = (s: Segment, t: ElevatorTimingSettings) =>
  travelMs(s.from, s.to, t) + (s.stop ? fullStopMs(t) : 0)


/* ───────── pure ETA calculator ───────── */

export function calcETA(p: ETACalcParams): number {
  const { currentFloor, currentTime, targetFloor, timing } = p;
  const proj: Projection = { time: currentTime, floor: currentFloor };
  const STOP = fullStopMs(timing);

  if (p.state !== ElevatorState.IDLE && !p.timingManager.isPaused()) {
    const end = p.timingManager.getActionFinishTime();
    if (end && end > proj.time) {
      if (p.state === ElevatorState.STOPPED_AT_FLOOR && proj.floor === targetFloor) {
        return Math.max(0, end - STOP - currentTime)
      }
      
      proj.time = end;
    }
  }

  const simQueue = p.queue.map(r => ({ ...r }));

  for (const req of simQueue) {
    // A) pickup
    if (!req.pickedUp) {
      proj.time += segMs({ from: proj.floor, to: req.sourceFloor, stop: true }, timing);
      proj.floor = req.sourceFloor;

      if (req.sourceFloor === targetFloor)
        return Math.max(0, proj.time - STOP - currentTime)

      req.pickedUp = true;   // local to simulation only
    }

    // B) drop‑off
   // proj.time += segMs({ from: proj.floor, to: req.destinationFloor, stop: true }, timing);
    proj.floor = req.destinationFloor;

    if (req.destinationFloor === targetFloor)
      return Math.max(0, proj.time - STOP - currentTime) 
  }

  /* 3 ▪ direct travel if never hit target */
  proj.time += travelMs(proj.floor, targetFloor, timing);
  return Math.max(0, proj.time - STOP - currentTime)
}


