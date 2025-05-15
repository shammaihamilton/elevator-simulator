// src/utils/Queue.ts

export class Queue<T> {
  private items: T[] = [];

  // Add an item to the end
  enqueue(item: T) {
    this.items.push(item);
  }

  // Remove and return the item from the front
  dequeue(): T | undefined {
    return this.items.shift();
  }

  // Peek at the item at the front without removing it
  peek(): T | undefined {
    return this.items[0];
  }

  // Check if the queue is empty
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Get current contents as an array
  toArray(): T[] {
    return [...this.items];
  }

  // Clear all items from the queue
  clear() {
    this.items = [];
  }

  // Optional: check current length
  length(): number {
    return this.items.length;
  }

  // Optional: get the last item
  last(): T | undefined {
    return this.items[this.items.length - 1];
  }

  // Optional: get the first item
  first(): T | undefined {
    return this.items[0];
  }

  // Optional: check if the queue contains an item
    contains(item: T): boolean {
    if (typeof item === 'object' && item !== null) {
      // Handle PassengerRequest objects by comparing source and destination floors
      // @ts-ignore - We'll handle the property check inline
      if ('sourceFloor' in item && 'destinationFloor' in item) {
        return this.items.some(queueItem => {
          // @ts-ignore - We're checking the properties exist above
          return (queueItem as any).sourceFloor === (item as any).sourceFloor && 
                 (queueItem as any).destinationFloor === (item as any).destinationFloor;
        });
      }
    }
    // Default behavior for primitive types
    return this.items.includes(item);
  }
    containsFloor(floorNumber: number): boolean {
    // @ts-ignore - We're checking for PassengerRequest objects
    return this.items.some(item => 
      ((item as { sourceFloor: number }).sourceFloor === floorNumber || (item as { destinationFloor: number }).destinationFloor === floorNumber)
    );
  }
}
