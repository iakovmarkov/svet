const debug = require("debug")("svet:server");
const Koa = require("koa");
const KoaRouter = require("koa-router");
const KoaBody = require("koa-bodyparser");
const auth = require("koa-basic-auth");
const { graphqlKoa, graphiqlKoa } = require("apollo-server-koa");
const { makeExecutableSchema } = require("graphql-tools");
const chroma = require("chroma-js");
const _ = require("lodash/fp");
const { get, map, matches } = _;

const nconf = require("../utils/config");

const typeDefs = `    
  type Gradient {
    from: String
    to: String
    current: String
    speed: Int
    steps: Int
    step: Int
  }

  type Query {
    devices: [Device]
    on: Boolean
    mode: String
    color: String
    gradient: Gradient
  }
  
  type Device {
    name: String
    connected: Boolean
  }
  
  type Mutation {
    toggle(value: Boolean!): Query
    setColor(color: String!): Query
    setGradient(from: String!, to: String!, steps: Int, speed: Int): Query
    reconnect: Query
  }
`;

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
      mode: () => {
        return svet.mode;
      },
      color: () => {
        return svet.color ? chroma(svet.color).toString() : ''
      },
      gradient: () => {
        return svet.gradient;
      },
    },

    Mutation: {
      toggle: (__, { value }) => {
        svet.toggle(value)
        return svet;
      },
      setColor: (__, { color }) => {
        svet.setColor(color)
        return svet;
      },
      setGradient: (__, { from, to, steps, speed }) => {
        svet.setGradient(from, to, steps, speed)
        return svet;
      },
      reconnect: async () => {
        await svet.reconnect();
        return svet;
      }
    }
  };

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
