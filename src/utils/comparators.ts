// src/utils/comparators.ts

/**
 * Comparator for numbers to sort in ascending order.
 * Suitable for MinHeap where the smallest number has the highest priority.
 * @param a - First number.
 * @param b - Second number.
 * @returns Negative if a < b, 0 if a === b, positive if a > b.
 */
export const ascNumberComparator = (a: number, b: number): number => a - b;

/**
 * Comparator for numbers to sort in descending order.
 * Suitable for MinHeap where the largest number has the highest priority
 * (if you want MinHeap to behave like a MaxHeap for positive numbers),
 * or directly for a MaxHeap implementation.
 * @param a - First number.
 * @param b - Second number.
 * @returns Negative if a > b, 0 if a === b, positive if a < b.
 */
export const descNumberComparator = (a: number, b: number): number => b - a;

// You might also want comparators for your request types if you haven't defined them elsewhere
// (e.g., in constants.ts as we did before).
// For example, for FloorCall, prioritizing by timestamp then by priority value:
import type { FloorCall } from '../types/interfaces'; // Assuming path to your interfaces

export const floorCallComparator = (a: FloorCall, b: FloorCall): number => {
  if (a.timestamp !== b.timestamp) {
    return a.timestamp - b.timestamp; // Earlier timestamp first
  }
  // Assuming lower priority number means higher actual priority
  return a.priority - b.priority;
};

// Add other comparators as needed, e.g., for PassengerRequest
// import type { PassengerRequest } from '../types/interfaces';
// export const passengerRequestComparator = (a: PassengerRequest, b: PassengerRequest): number => {
//   // Define comparison logic, e.g., by priority, then by requestTimestamp
//   if (a.priority !== b.priority) {
//     return a.priority - b.priority;
//   }
//   return a.requestTimestamp - b.requestTimestamp;
// };