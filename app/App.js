import React from "react";
import { ApolloProvider } from "react-apollo";
import {
  BallIndicator,
} from 'react-native-indicators';
import { Font } from "expo";
import { Ionicons } from "@expo/vector-icons";
import variables from 'native-base/src/theme/variables/platform'
import { ConfigManager } from "./src/ConfigManager";
import { ConnectionManager } from "./src/ConnectionManager";
import { ApplicationUI } from "./src/ApplicationUI";
import { Context } from "./src/AppContext";

export default class App extends React.Component {
  state = {
    ready: false,
    config: {}
  };

  async componentDidMount() {
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      ...Ionicons.font
    });

    const config = await ConfigManager.getConfig();

    this.setState({ ready: true, config });
  }

  async handleConfigChange(newConfig) {
    this.setState({ ready: false });
    const config = {
      ...this.state.config,
      ...newConfig
    };

    console.log('handleConfigChange start', config)
    await ConfigManager.setConfig(config);
    this.setState({ ready: true, config });
    console.log('handleConfigChange end', config)
  }

  render() {
    const { config, ready } = this.state;
    if (ready) {
      const client = ConnectionManager.createClient(config);
      return (
        <ApolloProvider client={client}>
          <Context.Provider
            value={{ config, handleConfigChange: this.handleConfigChange }}
          >
            <ApplicationUI config={config} />
          </Context.Provider>
        </ApolloProvider>
      );
    } else {
      return (
        <BallIndicator color={variables.brandSuccess} />
      );
    }
  }
}
