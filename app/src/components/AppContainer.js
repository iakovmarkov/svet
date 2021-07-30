import React from "react";
import Constants from "expo-constants";
import { View } from "react-native";
import { useFela } from "react-fela";
import { useQuery } from "react-apollo";
import gql from "graphql-tag";
import chroma from "../utils/chroma";
import { ThemeProvider } from "react-fela";

const QUERY = gql`
  {
    color
    on
  }
`;

const THEME = {
  dimensions: {
    padding: 5,
    margin: 5,
    tileWidth: 80,
  },
  control: {
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  colors: {
    red: '#f44336',
    blue: '#2196F3',
    green: '#8BC34A',
    yellow: '#FFC107',
  },
  shadow: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  }
}

const ruleAppContainer = ({ color }) => ({
  backgroundColor: "#ffffff",
  // borderTopColor: chroma(color)
  //   .desaturate(0.5)
  //   .darken(0.5),
  borderTopWidth: Constants.statusBarHeight,
  height: "100%",
  flex: 1
});

export const AppContainer = ({ children }) => {
  const { data: { color } = {} } = useQuery(QUERY);
  const { css } = useFela({ color });
  const theme = { ...THEME, color }

  return (
    <ThemeProvider theme={theme}>
      <View style={css(ruleAppContainer)}>{children}</View>
    </ThemeProvider>
  );
};
