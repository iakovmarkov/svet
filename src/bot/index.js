const debug = require("debug")("svet:telegraf");
const Telegraf = require("telegraf");
const bluetoothctl = require("bluetoothctl");
const _ = require("lodash/fp");
const { get, includes, pipe, split, map, size, join, filter } = _;
const { setOn, setOff, setColor } = require("../backend/playbulbController");
const { connect } = require("../backend/bluetoothController");
const { getName } = require("../backend/playbulbConfig");
const nconf = require("../utils/config");
const sleep = require("../utils/sleep");

const TOKEN = nconf.get("TOKEN");
const ALLOWED_USERS = nconf.get("ALLOWED_USERS");

const authMiddleware = (ctx, next) => {
  const username = get(["from", "username"])(ctx);
  const shouldRespond = includes(username, ALLOWED_USERS);

  if (shouldRespond) {
    next();
  } else {
    debug(`User ${username} isn't in allowed_usernames; Dropping message.`);
    ctx.reply(`I don't know you, go away!`);
  }
};

const serviceCommands = ["/reconnect", "/help"];
const devicesMiddleware = state => (ctx, next) => {
  const isServiceMessage = pipe(
    get(["message", "text"]),
    split(" "),
    get(0),
    includes(_, serviceCommands)
  )(ctx);

  if (isServiceMessage) {
    next();
  } else {
    const deviceList = filter(device => device.state === "connected")(
      state.devices
    );
    if (size(deviceList)) {
      next();
    } else {
      debug("Not connected to any device.");
      ctx.reply(`Oops, I think I'm not connected to any Playbulb`);
    }
  }
};

const replyHelp = ctx => {
  ctx.reply(`
/help - This help message
/on - Turns on all lights
/off - Turns off all lights
/set - Sets the lights to specified color
/devices - Lists connected devices
/reconnect - Tries to reconnect to all devices
    `);
};

const replyDevices = ctx => {
  const {
    state: { devices }
  } = ctx;
  const deviceList = pipe(
    filter(device => device.state === "connected"),
    map(device => getName(device))
  )(devices);
  const n = pipe(
    filter(device => device.state === "connected"),
    size
  )(devices);
  const s = n > 1 ? "s" : "";
  const otherDeviceCount = size(devices) - size(deviceList);
  const otherDevices = otherDeviceCount
    ? ` I also sense ${otherDeviceCount} other devices nearby.`
    : "";
  ctx.reply(
    `I'm connected to ${n} device${s}: ${join(
      ", ",
      deviceList
    )}.${otherDevices}`
  );
};

const replyOff = ctx => {
  ctx.reply("Turning off all lights.");
  setOff(ctx.state);
};

const replyOn = ctx => {
  ctx.reply("Turning lights back on");
  setOn(ctx.state);
};

const replySet = ctx => {
  const color = ctx.message.text.replace("/set ", "");
  try {
    setColor(ctx.state, color);
    ctx.reply(`Set the colors to ${color}`);
  } catch (e) {
    ctx.reply(e);
  }
};

const replyReconnect = async ctx => {
  const {
    state: { devices }
  } = ctx;
  const connectedDevices = [];
  const disconnectedDevices = filter(
    device => device.state !== "connected",
    devices
  );
  ctx.reply(`Trying to reconnect to ${size(disconnectedDevices)} devices.`);
  bluetoothctl.Bluetooth();
  bluetoothctl.scan(true);
  await sleep(1000);
  debug(
    `Trying to reconnect to ${size(
      disconnectedDevices
    )} devices: ${disconnectedDevices.map(device => getName(device))}`
  );
  await Promise.all(
    disconnectedDevices.map(
      device =>
        new Promise(async (resolve, reject) => {
          try {
            await connect(device);
          } catch (err) {
            debug(`Error connecting to device ${getName(device)}: ${err}`);
            ctx.reply(`Sorry, I couldn't connect to ${getName(device)} :(`);
            reject(err);
          }
          debug(`Reconnected to ${getName(device)} (state=${device.state})`);
          connectedDevices.push(getName(device));
          resolve();
        })
    )
  );
  if (connectedDevices.length) {
    ctx.reply(
      `Connected to ${connectedDevices.length} devices: ${connectedDevices.join(
        ", "
      )}`
    );
  } else {
    ctx.reply("Sorry, I couldn't connect to any device :(");
  }
};

const createBot = state => {
  const bot = new Telegraf(TOKEN);
  bot.context.state = state;

  bot.use(authMiddleware);
  bot.use(devicesMiddleware(state));

  bot.command("help", replyHelp);

  bot.command("devices", replyDevices);

  bot.command("off", replyOff);

  bot.command("on", replyOn);

  bot.command("set", replySet);

  bot.command("reconnect", replyReconnect);

  bot.startPolling();

  return bot;
};

module.exports = createBot;
