export class MinHeap<T> {
    private heap: T[] = [];
    private comparator: (a: T, b: T) => number;
  
    // Option 1: Original constructor
    // constructor(comparator: (a: T, b: T) => number) {
    //   this.comparator = comparator;
    // }
  
    // Option 2: Constructor that can also take initial items and heapify
    constructor(comparator: (a: T, b: T) => number, initialItems: T[] = []) {
      this.comparator = comparator;
      if (initialItems.length > 0) {
        this.heap = [...initialItems]; // Create a copy
        this.buildHeap();
      }
    }
  
    public get size(): number {
      return this.heap.length;
    }
  
    public isEmpty(): boolean {
      return this.size === 0;
    }
  
    public peek(): T | undefined {
      return this.heap[0];
    }
  
    public insert(item: T): void {
      this.heap.push(item);
      this.bubbleUp();
    }
  
    public extractMin(): T | undefined {
      if (this.isEmpty()) return undefined;
      if (this.size === 1) return this.heap.pop(); // Handles single element case simply
  
      const min = this.heap[0];
      // Move the last element to the top (pop guarantees it's not undefined if size > 1)
      this.heap[0] = this.heap.pop()!; 
      this.sinkDown();
  
      return min;
    }
  
    // The update method is fine. Its O(N) findIndex is generally acceptable
    // for the scale of an elevator problem (N = number of floors).
    public update(predicate: (item: T) => boolean, updater: (item: T) => T): void {
      const index = this.heap.findIndex(predicate);
      if (index === -1) return;
  
      const oldItem = this.heap[index];
      const newItem = updater(oldItem);
      this.heap[index] = newItem;
  
      // If the new item is "smaller" (higher priority), it might need to bubble up.
      // If it's "larger" (lower priority), it might need to sink down.
      if (this.comparator(newItem, oldItem) < 0) {
        this.bubbleUpFrom(index);
      } else if (this.comparator(newItem, oldItem) > 0) {
        // Note: if comparator returns 0 (equal), no structural change needed.
        this.sinkDownFrom(index);
      }
    }
  
    public toArray(): T[] {
      return [...this.heap]; // Return a copy
    }
  
    public clear(): void {
      this.heap = [];
    }
  
    public find(predicate: (item: T) => boolean): T | undefined {
      return this.heap.find(predicate); // O(N)
    }
  
    // Optional: Method to clone the heap (useful for React state updates)
    public clone(): MinHeap<T> {
      const newHeap = new MinHeap<T>(this.comparator);
      newHeap.heap = [...this.heap]; // Shallow copy of the array
      return newHeap;
    }
  
    // Heapify existing array (O(N))
    private buildHeap(): void {
      // Start from the last non-leaf node and sink down
      for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
        this.sinkDownFrom(i);
      }
    }
  
    private bubbleUp(): void {
      let idx = this.heap.length - 1;
      // No need to check idx > 0 here if heap isn't empty,
      // but it's safer if insert could be called on an empty heap then immediately bubbleUp.
      // However, push ensures length is at least 1.
      while (idx > 0) {
        const element = this.heap[idx]; // Element to bubble
        const parentIdx = Math.floor((idx - 1) / 2);
        const parent = this.heap[parentIdx];
  
        if (this.comparator(element, parent) >= 0) break; // Element is in correct place or larger
  
        // Swap
        this.heap[parentIdx] = element;
        this.heap[idx] = parent;
        idx = parentIdx;
      }
    }
  
    private bubbleUpFrom(index: number): void {
      let idx = index;
      while (idx > 0) {
        const element = this.heap[idx];
        const parentIdx = Math.floor((idx - 1) / 2);
        const parent = this.heap[parentIdx];
  
        if (this.comparator(element, parent) >= 0) break;
  
        this.heap[parentIdx] = element;
        this.heap[idx] = parent;
        idx = parentIdx;
      }
    }
  
    private sinkDown(): void {
      this.sinkDownFrom(0); // Sink down from the root
    }
  
    private sinkDownFrom(index: number): void {
      let idx = index;
      const length = this.heap.length;
      const element = this.heap[idx]; // Element to sink
  
      while (true) {
        const leftChildIdx = 2 * idx + 1;
        const rightChildIdx = 2 * idx + 2;
        let swapIdx: number | null = null;
  
        // Check left child
        if (leftChildIdx < length) {
          const leftChild = this.heap[leftChildIdx];
          if (this.comparator(leftChild, element) < 0) {
            swapIdx = leftChildIdx;
          }
        }
  
        // Check right child, see if it's smaller than current element AND left child (if any)
        if (rightChildIdx < length) {
          const rightChild = this.heap[rightChildIdx];
          const elementToCompareWith = swapIdx === null ? element : this.heap[swapIdx];
          if (this.comparator(rightChild, elementToCompareWith) < 0) {
            swapIdx = rightChildIdx;
          }
        }
  
        if (swapIdx === null) break; // Element is in correct place
  
        // Swap
        this.heap[idx] = this.heap[swapIdx];
        this.heap[swapIdx] = element;
        idx = swapIdx;
      }
    }
  }