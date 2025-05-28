// GlobalConfigPage.tsx - Refactored Main Component
import React from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalConfigForm } from "../hooks/useGlobalConfigForm";
import { useBuildingOverrides } from "../hooks/useBuildingOverrides";
import GlobalBuildingSettings from "@/components/fullConfiguraions/GlobalBuildingSettings";
import GlobalTimingSettings from "@/components/fullConfiguraions/GlobalTimingSettings";
import GlobalSimulationSettings from "@/components/fullConfiguraions/GlobalSimulationSettings";
import PerBuildingConfigSection from "@/components/fullConfiguraions/PerBuildingConfigSection";
import styles from "../components/fullConfiguraions/GlobalConfigPage.module.scss";

const GlobalConfigPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Custom hooks handle the complex logic
  const {
    formData,
    formErrors,
    handleChange,
    handleDispatchStrategyChange,
    validateAndGetSettings,
    applyGlobalSettings,
  } = useGlobalConfigForm();

  const {
    localBuildingOverrides,
    handleOverrideChange,
    handleResetToGlobal,
    applyBuildingOverrides,
    getCurrentGlobalDefaults,
  } = useBuildingOverrides(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { isValid, settings } = validateAndGetSettings();
    
    if (isValid && settings) {
      // Apply global settings
      applyGlobalSettings(settings);
      
      // Apply building-specific overrides
      applyBuildingOverrides(settings);
      
      // Navigate to simulation
      navigate("/simulation");
    } else {
      console.error("Global configuration errors:", formErrors);
    }
  };

  return (
    <div className={styles.globalConfig}>
      <h1 className={styles.header}>Global Configuration</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <GlobalBuildingSettings
          formData={formData}
          onChange={handleChange}
          onDispatchStrategyChange={handleDispatchStrategyChange}
        />

        <GlobalTimingSettings
          formData={formData}
          onChange={handleChange}
        />

        <GlobalSimulationSettings
          formData={formData}
          onChange={handleChange}
        />

        <PerBuildingConfigSection
          numberOfBuildings={formData.buildings.numberOfBuildings}
          localBuildingOverrides={localBuildingOverrides}
          globalDefaults={getCurrentGlobalDefaults()}
          onOverrideChange={handleOverrideChange}
          onResetToGlobal={handleResetToGlobal}
        />

        <div className={styles.actions}>
          <button type="submit" className={styles.submit}>
            Apply All Settings & Start Simulation
          </button>
          
          {Object.keys(formErrors).length > 0 && (
            <div style={{ color: "red", marginTop: "10px", textAlign: "left" }}>
              Please correct the errors before submitting. (See console for details)
              <pre>{JSON.stringify(formErrors, null, 0)}</pre>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default GlobalConfigPage;