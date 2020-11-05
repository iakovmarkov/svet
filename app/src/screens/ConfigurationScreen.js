import React, { useContext } from "react";

import { AppContainer } from "../components/AppContainer";
import { ConfigurationForm } from "../components/ConfigurationForm";
import ConfigContext from '../ConfigContext'

export const ConfigurationScreen = () => {
  const { config, saveConfig } = useContext(ConfigContext)
  
  return (
    <AppContainer>
      <ConfigurationForm initialValues={config} onSave={saveConfig} />
    </AppContainer>
  );
};
