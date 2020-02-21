import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { HomeScreen } from "./screens/HomeScreen";
import { ConfigurationScreen } from "./screens/ConfigurationScreen";

import { Menu } from "./components/Menu";

const routes = [
  { name: "Home", component: HomeScreen },
  { name: "Configuration", component: ConfigurationScreen }
];

const Drawer = createDrawerNavigator();

export const Navigator = () => (
  <NavigationContainer>
    <Drawer.Navigator
      initialRouteName={routes[0].name}
      drawerContent={props => <Menu {...props} />}
    >
      {routes.map(route => (
        <Drawer.Screen {...route} key={route.name} />
      ))}
    </Drawer.Navigator>
  </NavigationContainer>
);
