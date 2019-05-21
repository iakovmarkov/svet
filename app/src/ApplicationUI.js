import React from "react";
import { Root, Footer, FooterTab, Icon, Button, Text } from "native-base";
import { createBottomTabNavigator, createAppContainer } from "react-navigation";

import { HomeScreen } from "./screens/HomeScreen";
import { CustomScreen } from "./screens/CustomScreen";
import { ConfigurationScreen } from "./screens/ConfigurationScreen";

const routes = {
  Home: { screen: HomeScreen, icon: "color-palette" },
  Custom: { screen: CustomScreen, icon: "color-filter" },
  Configuration: { screen: ConfigurationScreen, icon: "color-wand" }
};

const Navigation = createAppContainer(
  createBottomTabNavigator(routes, {
    headerMode: "none",
    tabBarComponent: props => {
      console.log("keys", Object.keys(props.navigation));
      console.log("state", props.navigation.state);

      return (
        <Footer>
          <FooterTab>
            {props.navigation.state.routes.map((route, index) => (
              <Button
                key={route.key}
                onPress={() => props.navigation.navigate(route.key)}
                active={props.navigation.state.index === index}
              >
                <Icon name={routes[route.key].icon} />
                <Text>{route.key}</Text>
              </Button>
            ))}
          </FooterTab>
        </Footer>
      );
    }
  })
);

export class ApplicationUI extends React.Component {
  render() {
    const { config } = this.props;

    return (
      <Root>
        {config.SERVER_URL ? <Navigation /> : <ConfigurationScreen />}
      </Root>
    );
  }
}
