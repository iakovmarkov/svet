import React from "react";
import { Text } from "react-native";
import { Content } from "native-base";

import { AppContainer, AppHeader } from '../components/AppUI'
import { ConfigurationForm } from "../components/ConfigurationForm";

export class ConfigurationScreen extends React.Component {
  render() {
    return (
      <AppContainer>
        <AppHeader noSwitch>
          <Text>Settings</Text>
        </AppHeader>
        <Content padder>
          <ConfigurationForm />
        </Content>
      </AppContainer>
    );
  }
}
