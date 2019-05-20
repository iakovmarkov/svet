const debug = require("debug")("svet:telegraf");
const _ = require("lodash/fp");
const { identity } = _;
const { write, connect } = require("./bluetoothController");
const { getConfig, getName } = require("./playbulbConfig");
const { findColor } = require("../utils/color");

const setAllColors = async (devices, newColor) => {
  devices.forEach(async device => {
    if (device.state !== "connected") {
      debug(
        `Device ${getName(device)} is not connected, trying to reconnect...`
      );
      await connect(device);
      debug(`Reconnected to ${getName(device)}.`);
    }
    const { color, transformColor = identity } = getConfig(device);
    const deviceSpecificColor = transformColor(newColor);
    write(device, color, deviceSpecificColor);
  });
};

const setOff = state => {
  state.set("on", false);

  setAllColors(state.devices, [0, 0, 0, 0]);
};

const setOn = state => {
  state.set("on", true);

  setAllColors(state.devices, state.color);
};

const setColor = (state, color) => {
  const arr = Array.isArray(color) ? color : findColor(color);

  if (arr) {
    setAllColors(state.devices, arr);
    state.set("color", arr);
    state.set("on", true);
  } else {
    throw new Error(`Can't find a match for ${color}`);
  }
};

module.exports = {
  setOn,
  setOff,
  setColor
};