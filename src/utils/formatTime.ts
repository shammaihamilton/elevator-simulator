  
  const formatTime = (milliseconds: number): string => {
    const ms = Math.floor(milliseconds % 1000).toString().padStart(3, "0").slice(0, 2);
    const totalSeconds = Math.floor(milliseconds / 1000);    
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}.${ms}`;
  };
 export default formatTime;