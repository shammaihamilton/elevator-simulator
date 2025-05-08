import type { ElevatorRequest } from "../types/interfaces";
import { ElevatorState, type ElevatorState as StateType } from "../types/enums";

export class Elevator {
  id: string;
  currentFloor = 0;
  state: StateType = ElevatorState.IDLE;
  queue: ElevatorRequest[] = [];

  constructor(id: string) {
    this.id = id;
  }

  addRequest(request: ElevatorRequest) {
    this.queue.push(request);
  }

  moveOneStep() {
    if (this.queue.length === 0) {
      this.state = ElevatorState.IDLE;
      return;
    }

    const next = this.queue[0];
    if (this.currentFloor < next.sourceFloor) {
      this.currentFloor++;
      this.state = ElevatorState.MOVING_UP;
    } else if (this.currentFloor > next.sourceFloor) {
      this.currentFloor--;
      this.state = ElevatorState.MOVING_DOWN;
    } else {
      this.state = ElevatorState.DOOR_OPEN;
      this.queue.shift();
    }
  }

  estimateETA(floor: number): number {
    // אם אין בקשות בכלל – פשוט לחשב מרחק פיזי + דיליי פתיחת דלת
    if (this.queue.length === 0) {
      return Math.abs(this.currentFloor - floor) * 1000 + 5000;
    }
  
    // אם יש תור – נחשב ETA לפי התקדמות בתור
    let eta = 0;
    let current = this.currentFloor;
  
    for (const req of this.queue) {
      eta += Math.abs(current - req.sourceFloor) * 1000; // זמן תנועה
      eta += 5000; // זמן פתיחה+סגירה
      current = req.sourceFloor;
    }
  
    // בסוף, נוסיף מרחק מהנקודה האחרונה ליעד החדש
    eta += Math.abs(current - floor) * 1000;
    eta += 5000;
  
    return eta;
  }
    getStatus(): ElevatorRequest[] {
        return this.queue;
    }
    getCurrentFloor(): number {
        return this.currentFloor;
    }

    getState(): ElevatorState {
        return this.state;
    }

    getId(): string {
        return this.id;  
}
    getQueue(): ElevatorRequest[] {
        return this.queue;  
    }
    setState(state: ElevatorState) {
        this.state = state;
    }
    setCurrentFloor(floor: number) {
        this.currentFloor = floor;
    }
    setQueue(queue: ElevatorRequest[]) {
        this.queue = queue;
    }
    setId(id: string) {
        this.id = id;
    }
    setRequest(request: ElevatorRequest) {
        this.queue.push(request);
    }
    getDirection(): "UP" | "DOWN" | "IDLE" {
        if (this.queue.length === 0) return "IDLE";
        const target = this.queue[0].sourceFloor;
        if (this.currentFloor < target) return "UP";
        if (this.currentFloor > target) return "DOWN";
        return "IDLE";
      }
    getNextRequest(): ElevatorRequest | null {
        return this.queue.length > 0 ? this.queue[0] : null;
      } 

           

}