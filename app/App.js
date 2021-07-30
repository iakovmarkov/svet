import React from "react";

import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { AppLoading } from "expo";

import { AsyncStorage } from "react-native";

import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { ApolloNetworkStatusProvider } from "react-apollo-network-status";
import { btoa } from './src/utils/base64'

import { RendererProvider as FelaProvider } from "react-fela";
import { createRenderer } from "fela-native";

import { Navigator } from "./src/Navigator";

import ConfigContext from './src/ConfigContext'

const CONFIG_KEY = "@svet:config_10";
const DEFAULT_CONFIG = {
  BASIC_LOGIN: null,
  BASIC_PASSWORD: null,
  SERVER_URL: null,
};

const renderer = createRenderer();

const createClient = (config) => {
  const httpLinkConfig = {
    uri: config.SERVER_URL,
    headers:
      config.BASIC_LOGIN && config.BASIC_PASSWORD
        ? { Authorization: `Basic ${btoa(config.BASIC_LOGIN + ':' + config.BASIC_PASSWORD)}` }
        : undefined,
  };
  
  const cache = new InMemoryCache();
  const link = createHttpLink(httpLinkConfig);

  const client = new ApolloClient({
    cache,
    link,
  });

  return client;
};

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      config: DEFAULT_CONFIG,
      ready: false,
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      ...Ionicons.font,
    });

    const config = await this.loadConfig();

    this.setState({ ready: true, config });
  }

  async saveConfig(config) {
    const finalConfig = {
      ...this.state.config,
      ...config,
    };

    try {
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(finalConfig));
    } catch (e) {
      console.error("Saving config failed:", e);
      return;
    }

    this.setState({ config: finalConfig });
  }

  async loadConfig() {
    try {
      const json = await AsyncStorage.getItem(CONFIG_KEY);
      if (json !== null) {
        return JSON.parse(json);
      }
    } catch (e) {
      console.error("Loading config failed:", e);
    }

    return DEFAULT_CONFIG;
  }

  render() {
    const { config, ready } = this.state;
    
    const contextValue = {
      config,
      saveConfig: (newConfig) => this.saveConfig(newConfig),
    };

    if (ready) {
      const client = createClient(config);
      return (
        <ApolloProvider client={client}>
          <ApolloNetworkStatusProvider>
            <ConfigContext.Provider value={contextValue}>
              <FelaProvider renderer={renderer}>
                <Navigator />
              </FelaProvider>
            </ConfigContext.Provider>
          </ApolloNetworkStatusProvider>
        </ApolloProvider>
      );
    } else {
      return null;
      return <AppLoading />;
    }
  }
}
