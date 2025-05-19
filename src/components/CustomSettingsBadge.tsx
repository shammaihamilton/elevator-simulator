import { useSimulationStore } from "@/store/simulationStore";



const CustomSettingsBadge = ({ buildingIndex }: { buildingIndex: number }) => {
  const hasCustomSettings = useSimulationStore(
    (state) => !!state.buildingSpecificSettings[buildingIndex]
  );
  
  if (!hasCustomSettings) return null;
  
  return (
    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
      Custom Settings
    </span>
  );
};

export default CustomSettingsBadge;