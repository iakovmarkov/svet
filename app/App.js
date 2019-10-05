import React from "react";
import { ApolloProvider } from "react-apollo";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { AsyncStorage } from "react-native";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloNetworkStatusProvider } from 'react-apollo-network-status';

import { SplashScreen } from "./src/screens/SplashScreen";
import { Navigator } from "./src/Navigator";
import { Context } from "./src/AppContext";

console.ignoredYellowBox = [
  'Warning: Missing',
]

const DEFAULT_CONFIG = {
  BASIC_LOGIN: null,
  BASIC_PASSWORD: null,
  SERVER_URL: null
};

export default class App extends React.Component {
  static KEY = "@svet:config_10";

  constructor(props) {
    super(props);
    this.state = {
      config: DEFAULT_CONFIG,
      ready: false,
      recents: [],
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      ...Ionicons.font
    });

    const config = await this._loadConfig();

    this.setState({ ready: true, config });
  }

  async handleConfigChange(newConfig) {
    const config = {
      ...this.state.config,
      ...newConfig
    };

    try {
      await AsyncStorage.setItem(App.KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Saving config failed:", e);
      return;
    }

    this.setState({ config });
  }

  async _loadConfig() {
    try {
      const json = await AsyncStorage.getItem(App.KEY);
      if (json !== null) {
        return JSON.parse(json);
      }
    } catch (e) {
      console.error("Loading config failed:", e);
    }

    return DEFAULT_CONFIG;
  }

  _createClient() {
    const { config } = this.state || {};
    const cache = new InMemoryCache();

    const link = new HttpLink({
      uri: config.SERVER_URL
    });

    const client = new ApolloClient({
      cache,
      link
    });

    return client;
  }

  render() {
    const { config, ready } = this.state;
    const contextValue = {
      config,
      handleConfigChange: newConfig => this.handleConfigChange(newConfig)
    };

    if (ready) {
      const client = this._createClient();
      return (
        <ApolloProvider client={client}>
          <ApolloNetworkStatusProvider>
            <Context.Provider value={contextValue}>
              <Navigator />
            </Context.Provider>
          </ApolloNetworkStatusProvider>
        </ApolloProvider>
      );
    } else {
      return <SplashScreen />;
    }
  }
}
