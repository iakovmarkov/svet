import { ApolloClient } from "apollo-client";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

export class ConnectionManager {
  static client

  static checkConnection(config) {
    console.warn('NYI - CheckConnection', config)
    return true;
  }

  static createClient(config) {
    const cache = new InMemoryCache();

    const link = new HttpLink({
      uri: config.SERVER_URL
    })

    const client = new ApolloClient({
      cache,
      link
    })

    console.log('Client config: ', config)

    ConnectionManager.client = client

    return client
  }
}
