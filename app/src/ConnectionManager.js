import React from "react";
import { ApolloClient } from "apollo-client";
import { ApolloProvider } from "react-apollo";

import { ConfigContext } from "./ConfigManager";

const debug = require("debug")("svet:app:connection");

export const ConnectionContext = React.createContext();

export class ConnectionManager extends React.Component {
  static checkConnection(url) {
    console.warn('NYI - CheckConnection')
    return true;
  }

  render() {
    const children = (
      <ConnectionContext.Provider value={0}>
        {this.props.children}
      </ConnectionContext.Provider>
    )

    return (
        <ConfigContext.Consumer>
          {({ config }) => {
            if (config.SERVER_URL) {
              try {
                const client = new ApolloClient({
                  uri: config.SERVER_URL
                });

                return (
                  <ApolloProvider client={client}>
                    {children}
                  </ApolloProvider>
                );
              } catch (e) {}
            }

            return children;
          }}
        </ConfigContext.Consumer>
    );
  }
}
