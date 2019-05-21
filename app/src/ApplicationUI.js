import React from "react";
import { Root } from "native-base";
import { createBottomTabNavigator, createAppContainer } from "react-navigation";

import { HomeScreen } from "./screens/HomeScreen";
import { CustomScreen } from "./screens/CustomScreen";
import { ConfigurationScreen } from "./screens/ConfigurationScreen";

const Navigation = createAppContainer(createBottomTabNavigator(
  {
    Home: { screen: HomeScreen },
    Custom: { screen: CustomScreen },
    Configuration: { screen: ConfigurationScreen },
  }, {
    headerMode: 'none'
  }
));

export class ApplicationUI extends React.Component {
  render() {
    const { config } = this.props

    return (
      <Root>
        {config.SERVER_URL ? <Navigation /> : <ConfigurationScreen />}
      </Root>
    );
  }
}
