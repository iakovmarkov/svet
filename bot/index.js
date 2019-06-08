const debug = require("debug")("svet:telegraf");
const Telegraf = require("telegraf");
const bluetoothctl = require("bluetoothctl");
const _ = require("lodash/fp");
const { get, includes, pipe, split, map, size, join, filter } = _;

const bt = require("../utils/bt");
const playbulb = require("../utils/playbulb");
const nconf = require("../utils/config");
const sleep = require("../utils/sleep");
const colors = require("../utils/colors");

const TOKEN = nconf.get("TOKEN");
const ALLOWED_USERS = nconf.get("ALLOWED_USERS");

const authMiddleware = (ctx, next) => {
  const username = get(["from", "username"])(ctx);
  const shouldRespond = includes(username, ALLOWED_USERS);

  if (shouldRespond) {
    next();
  } else {
    debug(`User ${username} isn't in ${ALLOWED_USERS}; Dropping message.`);
    ctx.reply(`I don't know you, go away!`);
  }
};

const devicesMiddleware = (ctx, next) => {
  const isServiceMessage = pipe(
    get(["message", "text"]),
    split(" "),
    get(0),
    includes(_, ["/reconnect", "/help"])
  )(ctx);
  const deviceList = filter(device => device.state === "connected")(ctx.svet.devices);

  if (isServiceMessage || size(deviceList)) {
    next();
  } else {
    ctx.reply(`Oops, I think I'm not connected to any Playbulb`);
  }
};

const replyHelp = ctx => {
  ctx.reply(`
/help - This help message
/on - Turns on all lights
/off - Turns off all lights
/set - Sets the lights to specified color
/gradient - Starts to cycle lights bettween two colors
/devices - Lists connected devices
/reconnect - Tries to reconnect to all devices
    `);
};

const replyDevices = ctx => {
  const devices = ctx.svet.devices
  const connectedDevices = pipe(
    filter(device => device.state === "connected"),
    map(device => playbulb.getName(device))
  )(devices);

  const otherDeviceCount = size(devices) - size(connectedDevices);

  ctx.reply(
    `I'm connected to ${size(connectedDevices)} device${size(devices) > 1 ? "s" : ""}: ${join(", ", connectedDevices)}`
  );
  
  if (otherDeviceCount) {
    ctx.reply(
      `There are also ${otherDeviceCount} other device${size(devices) > 1 ? "s" : ""} nearby.`
    );
  }
};

const replyOff = ctx => {
  ctx.reply("Turning off all lights.");
  ctx.svet.toggle(false)
};

const replyOn = ctx => {
  ctx.reply("Turning lights back on");
  ctx.svet.toggle(true)
};

const replyGradient = ctx => {
  const colors = ctx.message.text.replace("/gradient ", "").split(" ");
  try {
    ctx.svet.setGradient(colors[0], colors[1]);
    ctx.reply(`Started gradient between ${colors[0]} and ${colors[1]}`);
  } catch (e) {
    ctx.reply(e);
  }
};

const replySet = ctx => {
  const color = ctx.message.text.replace("/set ", "");
  try {
    ctx.svet.setColor(colors.findColor(color) || color);
    ctx.reply(`Set the colors to ${color}`);
  } catch (e) {
    ctx.reply(e);
  }
};

const replyReconnect = async ctx => {
  const devices = ctx.svet.devices
  const connectedDevices = [];
  const disconnectedDevices = filter(
    device => device.svet !== "connected",
    devices
  );
  ctx.reply(`Trying to reconnect to ${size(disconnectedDevices)} devices.`);
  bluetoothctl.Bluetooth();
  bluetoothctl.scan(true);
  await sleep(1000);
  debug(
    `Trying to reconnect to ${size(
      disconnectedDevices
    )} devices: ${disconnectedDevices.map(device => playbulb.getName(device))}`
  );
  await Promise.all(
    disconnectedDevices.map(
      device =>
        new Promise(async (resolve, reject) => {
          try {
            await bt.connect(device);
          } catch (err) {
            debug(`Error connecting to device ${playbulb.getName(device)}: ${err}`);
            ctx.reply(`Sorry, I couldn't connect to ${playbulb.getName(device)} :(`);
            reject(err);
          }
          debug(`Reconnected to ${playbulb.getName(device)} (svet=${device.svet})`);
          connectedDevices.push(playbulb.getName(device));
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

const createBot = svet => {
  const bot = new Telegraf(TOKEN);
  bot.context.svet = svet;

  bot.use(authMiddleware);
  bot.use(devicesMiddleware);

  bot.command("help", replyHelp);
  bot.command("devices", replyDevices);
  bot.command("off", replyOff);
  bot.command("on", replyOn);
  bot.command("set", replySet);
  bot.command("gradient", replyGradient);
  bot.command("reconnect", replyReconnect);

  bot.startPolling();

  return bot;
};

module.exports = createBot;
