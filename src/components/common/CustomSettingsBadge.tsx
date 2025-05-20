import { useSimulationStore } from "@/store/simulationStore";



const CustomSettingsBadge = ({ buildingIndex, style }: { buildingIndex: number, style: string }) => {
  const hasCustomSettings = useSimulationStore(
    (state) => !!state.buildingSpecificSettings[buildingIndex]
  );
  
  if (!hasCustomSettings) return null;
  
  return (
    
    <span className={style}>
      Custom Settings
    </span>
  );
};

export default CustomSettingsBadge;