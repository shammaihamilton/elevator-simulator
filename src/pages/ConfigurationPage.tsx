import { useNavigate } from 'react-router-dom';
import { useSimulationStore } from '../store/simulationStore';
import type { BuildingConfig } from '../types/interfaces';
import { DispatchStrategy } from '../types/enums';
import ConfigurationDialog from '../components/ConfigurationDialog';
// import { defaultElevatorSystemConfig } from '../config';

const defaultConfig: BuildingConfig = {
  numberOfFloors: 11,
  numberOfElevators: 3,
  elevatorCapacity: 8,
  doorOpenTimeMs: 3000,
  doorTransitionTimeMs: 1500,
  floorTravelTimeMs: 2000,
  dispatchStrategy: DispatchStrategy.CLOSEST_CABIN,
  simulationTickMs: 100
};

export default function ConfigurationPage() {
  const navigate = useNavigate();
  const initializeSimulation = useSimulationStore(state => state.initializeSimulation);

  const handleSave = (config: BuildingConfig) => {
    // Initialize with a single building and one system
    const buildingLayout = [{
      numSystems: 1,
      systemConfig: config
    }];
    
    initializeSimulation(config, buildingLayout);
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div>
        <ConfigurationDialog
          initialConfig={defaultConfig}
          onSave={handleSave}
          onCancel={handleCancel}
        />
    </div>
  );
}
