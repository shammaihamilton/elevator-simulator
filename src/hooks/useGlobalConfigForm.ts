// // hooks/useGlobalConfigForm.ts
// import { useState } from "react";
// import { useSimulationStore } from "@/store/simulationStore";
// import { AppSettings, SettingsSchema } from "@/config/settingsSchema";
// import { DispatchStrategy } from "@/types/enums/dispatchStrategy.enums";

// export const useGlobalConfigForm = () => {
//   const storeSettings = useSimulationStore((s) => s.settings);
//   const updateSettings = useSimulationStore((s) => s.updateSettings);
// //   const setDispatchStrategy = useSimulationStore((s) => s.setDispatchStrategy);
  
//   const [formData, setFormData] = useState<AppSettings>(storeSettings as AppSettings);
//   const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined>>({});

//   const handleChange = <S extends keyof AppSettings>(
//     section: S,
//     field: keyof AppSettings[S],
//     value: number
//   ) => {
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       [section]: {
//         ...prevFormData[section],
//         [field]: value,
//       },
//     }));
//   };

//   const handleDispatchStrategyChange = (value: string) => {
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       buildings: {
//         ...prevFormData.buildings,

//         dispatchStrategy: value as DispatchStrategy,
//       },
//     }));
//   };

//   const validateAndGetSettings = () => {
//     setFormErrors({});
//     const parseResult = SettingsSchema.safeParse(formData);
    
//     if (parseResult.success) {
//       return { isValid: true, settings: parseResult.data };
//     } else {
//       const flattenedErrors = parseResult.error.flatten().fieldErrors;
//       setFormErrors(flattenedErrors as Record<string, string[] | undefined>);
//       return { isValid: false, settings: null };
//     }
//   };

//   const applyGlobalSettings = (validatedSettings: AppSettings) => {
//     updateSettings(validatedSettings);
//   };

//   return {
//     formData,
//     formErrors,
//     handleChange,
//     handleDispatchStrategyChange,
//     validateAndGetSettings,
//     applyGlobalSettings,
//   };
// };
// hooks/useGlobalConfigForm.ts
import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { AppSettings, SettingsSchema } from "@/config/settingsSchema";
import { DispatchStrategy } from "@/types/enums/dispatchStrategy.enums";

export const useGlobalConfigForm = () => {
  const storeSettings = useSimulationStore((s) => s.settings);
  const updateSettings = useSimulationStore((s) => s.updateSettings);
  const setDispatchStrategy = useSimulationStore((s) => s.setDispatchStrategy);
  
  const [formData, setFormData] = useState<AppSettings>(storeSettings as AppSettings);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined>>({});

  const handleChange = <S extends keyof AppSettings>(
    section: S,
    field: keyof AppSettings[S],
    value: number
  ) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [section]: {
        ...prevFormData[section],
        [field]: value,
      },
    }));
  };

  const handleDispatchStrategyChange = (value: string) => {
    const newStrategy = value as DispatchStrategy;
    
    // Update form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      buildings: {
        ...prevFormData.buildings,
        dispatchStrategy: newStrategy,
      },
    }));
    console.log("Dispatch strategy changed to:", newStrategy);
    // Apply immediately to the simulation
    setDispatchStrategy(newStrategy);
  };

  const validateAndGetSettings = () => {
    setFormErrors({});
    const parseResult = SettingsSchema.safeParse(formData);
    
    if (parseResult.success) {
      return { isValid: true, settings: parseResult.data };
    } else {
      const flattenedErrors = parseResult.error.flatten().fieldErrors;
      setFormErrors(flattenedErrors as Record<string, string[] | undefined>);
      return { isValid: false, settings: null };
    }
  };

  const applyGlobalSettings = (validatedSettings: AppSettings) => {
    // For other settings that require full recreation
    updateSettings(validatedSettings);
  };

  return {
    formData,
    formErrors,
    handleChange,
    handleDispatchStrategyChange,
    validateAndGetSettings,
    applyGlobalSettings,
  };
};
