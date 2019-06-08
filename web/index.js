const debug = require("debug")("svet:server");
const Koa = require("koa");
const KoaRouter = require("koa-router");
const KoaBody = require("koa-bodyparser");
const auth = require("koa-basic-auth");
const { graphqlKoa, graphiqlKoa } = require("apollo-server-koa");
const { makeExecutableSchema } = require("graphql-tools");
const _ = require("lodash/fp");
const { get, map, matches } = _;

const nconf = require("../utils/config");

const createWebServer = svet => {
  const app = new Koa();
  const router = new KoaRouter();

  if (nconf.get("BASIC_LOGIN") && nconf.get("BASIC_PASSWORD")) {
    app.use(
      auth({
        name: nconf.get("BASIC_LOGIN"),
        pass: nconf.get("BASIC_PASSWORD")
      })
    );
  }

  const resolvers = {
    Query: {
      devices: () => {
        return map(device => ({
          name: get(["advertisement", "localName"], device),
          connected: matches({ state: "connected" }, device)
        }))(svet.devices);
      },
      on: () => {
        return svet.on;
      },
      color: () => {
        const color = svet.color.slice(1, 4);
        return color.toString();
      }
    },

    Mutation: {
      turnOn: () => {
        svet.toggle(true)
        return svet;
      },
      turnOff: () => {
        svet.toggle(false)
        return svet;
      },
      setColor: (__, { color }) => {
        svet.toggle(color)
        return svet;
      }
    }
  };

  const typeDefs = `
    type Query {
      devices: [Device]
      on: Boolean
      color: String
    }
    
    type Device {
      name: String
      connected: Boolean
    }
    
    type Mutation {
      turnOn: Query
      turnOff: Query
      setColor(color: String!): Query
    }
  `;

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  router.post("/", KoaBody(), graphqlKoa({ schema }));
  // router.get("/", graphqlKoa({ schema }));
  router.get('/', graphiqlKoa({ endpointURL: '/' }))

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen(nconf.get("PORT"), () =>
    debug(`Server running on http://localhost:${nconf.get("PORT")}`)
  );
};

module.exports = createWebServer;
