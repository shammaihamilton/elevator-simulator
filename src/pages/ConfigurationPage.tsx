// import { useNavigate } from 'react-router-dom';
// import { useSimulationStore } from '../store/simulationStore';
// import type { BuildingConfig } from '../types/upgraed.enums/interfaces';
// // import { DispatchStrategy } from '../types/enums';
// import ConfigurationDialog from '../components/old-components/ConfigurationDialog';
// // import { defaultElevatorSystemConfig } from '../config';
// import { defaultElevatorSystemConfig } from '../config/defaultConfig';



// export default function ConfigurationPage( ) {
//   const navigate = useNavigate();
//   const initializeSimulation = useSimulationStore(state => state.initializeSimulation);

//   const handleSave = (config: BuildingConfig) => {
//     // Initialize with a single building and one system
//     const buildingLayout = [{
//       numSystems: 1,
//       systemConfig: config
//     }];
    
//     initializeSimulation(config, buildingLayout);
//     navigate('/');
//   };

//   const handleCancel = () => {
//     navigate('/');
//   };

//   return (
//     <div>
//         <ConfigurationDialog
//           initialConfig={defaultElevatorSystemConfig}
//           onSave={handleSave}
//           onCancel={handleCancel}
//         />
//     </div>
//   );
// }
