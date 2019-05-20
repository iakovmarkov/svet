const { red } = require("chalk");
const debug = require("debug")("svet:backend");
const {
  initBluetooth,
  startScan,
  connect,
  read
} = require("../backend/bluetoothController");
const { isPlaybulb, getConfig } = require("../backend/playbulbConfig");
const createBot = require("../bot");
const createWeb = require("../server");
const keepalive = require("../backend/keepalive");

const nconf = require("../utils/config");

function State(initialState = {}) {
  this.bt = initialState.bt;
  this.devices = initialState.devices || [];
  this.on = initialState.on;
  this.color = initialState.color || nconf.get('DEFAULT_COLOR');

  this.set = (prop, value) => {
    this[prop] = value;
  };
}

const main = async () => {
  const state = new State();
  const bt = await initBluetooth()
  await startScan(bt);

  state.set("bt", bt);

  state.bt.on("discover", async device => {
    if (isPlaybulb(device)) {
      const { name, color: handle } = getConfig(device);
      debug("Playbulb found:", name);
      try {
        await connect(device);
      } catch (err) {
        console.error(red(err));
      }
      
      state.devices.push(device);
      debug(`Connected to ${name} (${state.devices.length} devices total)`);

      if (!state.color) {
        const buffer = await read(device, handle);
        const color = [...buffer];

        debug("Read current color:", color);

        state.set("color", color);
        state.set("on", true);
      }
    }
  });

  if (nconf.get("BOT")) {
    debug("Starting Telegram bot");
    createBot(state);
  }

  if (nconf.get("WEB")) {
    debug("Starting GraphQL API");
    createWeb(state);
  }

  keepalive(state);
};

module.exports = main;
