// src/utils/comparators.ts

import type { FloorCall, PassengerRequest } from '../types/interfaces'; // Added PassengerRequest

// Ascending number comparator — for MinHeap (lowest number has highest priority)
export const ascNumberComparator = (a: number, b: number): number => a - b;

// Descending number comparator — for MinHeap acting as MaxHeap (highest number = highest priority)
export const descNumberComparator = (a: number, b: number): number => b - a;

// Comparator for FloorCall — sort by timestamp, then by priority (lower number = higher priority)
export const floorCallComparator = (a: FloorCall, b: FloorCall): number => {
  if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
  return a.priority - b.priority;
};

// NEW: Comparator for PassengerRequest
// Prioritize by 'priority' field (lower number = higher actual priority),
// then by 'creationTime' (earlier time = higher actual priority).
export const passengerRequestComparator = (a: PassengerRequest, b: PassengerRequest): number => {
  if (a.priority !== b.priority) {
    return a.priority - b.priority; // Lower priority value means higher priority
  }
  return a.timing.creationTime - b.timing.creationTime; // Earlier timestamp means higher priority
};