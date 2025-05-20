
import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import Building from '@/components/buildingsComponents/Building';
import styles from './BuildingContainer.module.scss';

const BuildingContainer: React.FC = () => {
  const settings = useSimulationStore(s => s.settings);
  const tick = useSimulationStore(s => s.tick);
  const resetSimulation = useSimulationStore(s => s.reset);
  const pauseSim = useSimulationStore(s => s.pauseSimulation);
  const resumeSim = useSimulationStore(s => s.resumeSimulation);
  const isSimPaused = useSimulationStore(s => s.isPaused);
  const { simulationTickMs } = settings.simulation;

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // clear existing interval
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // set new interval if not paused
    if (!isSimPaused) {
      intervalRef.current = window.setInterval(tick, simulationTickMs);
    }
    return () => {
      if (intervalRef.current != null) clearInterval(intervalRef.current);
    };
  }, [tick, simulationTickMs, isSimPaused]);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button className={styles.btn} onClick={resetSimulation}>
          Restart Simulation
        </button>
        <button
          className={styles.btn}
          onClick={() => (isSimPaused ? resumeSim() : pauseSim())}
        >
          {isSimPaused ? 'Resume Simulation' : 'Pause Simulation'}
        </button>
      </div>

      <div className={styles.buildings}>
        {Array.from({ length: settings.buildings.numberOfBuildings }).map((_, idx) => (
          <Building key={idx} buildingIndex={idx} />
        ))}
      </div>
    </div>
  );
};

export default BuildingContainer;
