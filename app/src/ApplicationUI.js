import React from "react";
import { Root } from "native-base";
import { ConfigContext } from "./ConfigManager";
import { HomeScreen } from "./screens/HomeScreen";
import { ConfigurationScreen } from "./screens/ConfigurationScreen";

export class ApplicationUI extends React.Component {
  static contextType = ConfigContext;

  render() {
    return (
      <Root>
        <ConfigContext.Consumer>
          {({ config }) => {
            if (config.SERVER_URL) {
              return <HomeScreen />;
            }
            return <ConfigurationScreen wrap />;
          }}
        </ConfigContext.Consumer>
      </Root>
    );
  }
}

ApplicationUI.contextType = ConfigContext;
