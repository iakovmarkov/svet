import React from "react";
import { Root } from "native-base";
import { createDrawerNavigator, createAppContainer } from "react-navigation";

import { HomeScreen } from "./screens/HomeScreen";
import { SwatchesScreen } from "./screens/SwatchesScreen";
import { GradientScreen } from "./screens/GradientScreen";
import { CustomScreen } from "./screens/CustomScreen";
import { ConfigurationScreen } from "./screens/ConfigurationScreen";

import { Menu } from "./components/Menu";

const routes = {
  Home: { screen: HomeScreen },
  Swatches: { screen: SwatchesScreen },
  Gradient: { screen: GradientScreen },
  Custom: { screen: CustomScreen },
  Configuration: { screen: ConfigurationScreen },
};

const Navigation = createAppContainer(
  createDrawerNavigator(routes, {
    headerMode: "none",
    contentComponent: props => <Menu {...props} />
  })
);

export class Navigator extends React.Component {
  render() {  
    return (
      <Root>
        <Navigation />
      </Root>
    );
  }
}
