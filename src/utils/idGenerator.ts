// Simple utility to generate sequential unique string IDs.
let nextId = 0;

export function generateId( prefix = "" ): string {
  return `id-${prefix}-${nextId++}`;
}