// Simple utility to generate sequential unique string IDs.
let nextId = 0;

export function generateId(): string {
  return `id-${nextId++}`;
}