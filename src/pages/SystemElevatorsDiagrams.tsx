// // pages/SystemElevatorsDiagrams.tsx
// import React from 'react';
// import MermaidDiagram from '@/components/MermaidDiagram';

// const diagrams = [
//   {
//     title: '🔁 Design Patterns Overview',
//     id: 'design-patterns',
//     chart: `
//       graph TD
//       State[State Pattern] --> FSM
//       Strategy[Strategy Pattern] --> Manager
//       Factory[Factory Pattern] --> Factories
//       Observer[Observer Pattern] --> Zustand
//       Composition[Component Composition] --> React
//       Command[Command Pattern] --> Manager
//       Command --> FSM
//       MVC[MVC Pattern] --> FSM
//       MVC --> React
//       MVC --> Zustand
//     `
//   },
//   {
//     title: '🧠 ElevatorFSM – State Transitions',
//     id: 'fsm-transitions',
//     chart: `
//       stateDiagram-v2
//       [*] --> IDLE
//       IDLE --> MOVING_UP : if current < target
//       IDLE --> MOVING_DOWN : if current > target
//       MOVING_UP --> STOPPED_AT_FLOOR : if arrived
//       MOVING_DOWN --> STOPPED_AT_FLOOR : if arrived
//       STOPPED_AT_FLOOR --> IDLE : after doors close
//     `
//   },
//   {
//     title: '📥 Elevator Request Flow',
//     id: 'request-flow',
//     chart: `
//       flowchart TD
//         Start([User Clicks Floor Button])
//         Start --> StoreFunc[Store: requestElevator()]
//         StoreFunc --> Handle[Manager: handleRequest()]
//         Handle --> SelectFSM[Select best ElevatorFSM]
//         SelectFSM --> AddStop[ElevatorFSM: addStop()]
//         AddStop --> Update[updateFloorStatuses()]
//         Update --> End([Done])
//     `
//   },
//   {
//     title: '🌐 Full App Flow – User → FSM → UI',
//     id: 'full-app-flow',
//     chart: `
//       flowchart TD
//         UserClick([User Clicks Button])
//         UserClick --> FloorOnRequest[Floor.onRequest()]
//         FloorOnRequest --> StoreRequest[Zustand: requestElevator()]
//         StoreRequest --> ManagerDispatch[ElevatorManager.handleRequest()]
//         ManagerDispatch --> BestFSM[Select Best ElevatorFSM]
//         BestFSM --> FSMAddStop[ElevatorFSM.addStop()]
//         FSMAddStop --> Tick[Simulation Tick Loop]
//         Tick --> FSMUpdate[ElevatorFSM.update()]
//         FSMUpdate --> UpdateStatuses[updateFloorStatuses()]
//         UpdateStatuses --> Rerender[React re-renders Floor + Elevator]
//         Rerender --> UserView([User sees elevator arriving])
//     `
//   }
// ];

// const SystemElevatorsDiagrams: React.FC = () => {
//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8 text-center">🚀 Elevator Simulation Diagrams</h1>
//       {diagrams.map(({ title, chart, id }) => (
//         <MermaidDiagram key={id} chart={chart} chartId={id} title={title} />
//       ))}
//     </div>
//   );
// };

// export default SystemElevatorsDiagrams;
