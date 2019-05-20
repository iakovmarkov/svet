const debug = require("debug")("svet:server");
const Koa = require("koa");
const KoaRouter = require("koa-router");
const KoaBody = require("koa-bodyparser");
const auth = require("koa-basic-auth");
const { graphqlKoa, graphiqlKoa } = require("apollo-server-koa");
const nconf = require("../utils/config");
const { parseColorString } = require("../utils/color");
const { makeExecutableSchema } = require("graphql-tools");
const { setOn, setOff, setColor } = require("../backend/playbulbController");
const _ = require("lodash/fp");
const { get, map, matches } = _;

const createServer = state => {
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
        }))(state.devices);
      },
      on: () => {
        return state.on;
      },
      color: () => {
        const color = state.color.slice(1, 4);
        return color.toString();
      }
    },

    Mutation: {
      turnOn: () => {
        setOn(state);
        return state;
      },
      turnOff: () => {
        setOff(state);
        return state;
      },
      setColor: (__, { color }) => {
        const finalColor = parseColorString(color)
        setColor(state, finalColor);
        return state;
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

module.exports = createServer;
