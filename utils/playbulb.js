const { get, pipe, map, find, includes, matches } = require("lodash/fp");

const configs = [
  {
    name: "PLAYBULB sphere",
    handle: "0x0029"
  },
  {
    name: "MIPOW SMART BULB",
    handle: "0x001b"
  },
  {
    name: "PLAYBULB comet",
    handle: "0x0023"
  }
];

const isPlaybulb = device => {
  const name = device.advertisement.localName;
  return pipe(
    map("name"),
    names => includes(name, names)
  )(configs);
};

const getConfig = device => {
  const name = device.advertisement.localName;
  return find(matches({ name }))(configs);
};

const getName = get(["advertisement", "localName"]);

module.exports = {
  isPlaybulb,
  getConfig,
  getName
};
