const debug = require("debug")("svet:keepalive");
const nconf = require("../utils/config");

const { connect } = require("./bluetoothController");
const { getName } = require("./playbulbConfig");
const { pipe, filter, map, join, size } = require("lodash/fp");
const ms = require("pretty-ms");

const KEEPALIVE_INTERVAL = nconf.get("KEEPALIVE_INTERVAL");

const sleep = async timeout =>
  new Promise(resolve => setInterval(resolve, timeout));

const keepalive = async state => {
  while (true) {
    await sleep(KEEPALIVE_INTERVAL);

    const connectedDevices = filter(
      device => device.state === "connected",
      state.devices
    );

    const otherDevices = filter(
      device => device.state !== "connected",
      state.devices
    );

    if (size(connectedDevices)) {
      debug(`Connected to ${size(connectedDevices)} devices:`)
      for (const device of connectedDevices) {
        debug(getName(device))
      }
    }

    if (size(otherDevices)) {
      debug(`Other ${size(otherDevices)} devices visible:`)
      for (const device of otherDevices) {
        debug(getName(device))
      }
    }

    otherDevices.forEach(async device => {
      debug(
        `Device ${getName(device)} is not connected, trying to reconnect...`
      );
      await connect(device);
      debug(`Connected to ${getName(device)} (${state.devices.length} devices total)`);
    });

    debug(`Next scan in ${ms(KEEPALIVE_INTERVAL)}`);
  }
};

module.exports = keepalive;