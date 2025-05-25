




export const getDomBasedYForFloor = (
  floor: number,
  floorRefs: Record<number, HTMLDivElement | null>
): number | null => {
  const floorElement = floorRefs[floor];
  if (!floorElement) {
    console.warn(`Floor ${floor} element not found in refs`);
    return null;
  }

  const rect = floorElement.getBoundingClientRect();
  
  // Get parent rect for positioning relative to parent
  const parentElement = floorElement.offsetParent;
  if (!parentElement) {
    console.warn(`No parent element found for floor ${floor}`);
    return null;
  }
  
  const parentRect = parentElement.getBoundingClientRect();
  
  // Calculate the Y position based on the floor element's position
  const elevatorHeight = 70; // Match the elevator height in the component
  const posY = rect.top - parentRect.top + (rect.height / 2) - (elevatorHeight / 2);
  
  
  return posY;
};


  export const logFloorPositions = ( floorRefs: Record<number, HTMLDivElement | null>) => {
    Object.entries(floorRefs).forEach(([floor, ref]) => {
      if (ref) {
        const y = getDomBasedYForFloor(parseInt(floor), floorRefs);
      }
    });
  };