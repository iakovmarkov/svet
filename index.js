const chalk = require("chalk");
const debug = require("debug")("svet:application");
const { filter, size } = require("lodash/fp");
const ms = require("pretty-ms");
const chroma = require("chroma-js");

const playbulb = require("./utils/playbulb");
const bt = require("./utils/bt");
const clearScreen = require("./utils/clearScreen");
const nconf = require("./utils/config");
const createBot = require("./bot");
const createWebServer = require("./web");
const sleep = require("./utils/sleep");

class Svet {
  static get MODE() {
    return {
      color: 'COLOR',
      gradient: 'GRADIENT',
    }
  }

  constructor () {
    debug('Svet initializing')
    this.devices = []
    this.gradient = {}
    this.mode = Svet.MODE.color
    this.on = false

    this._initBluetooth()

    if (nconf.get("BOT")) {
      debug("Starting Telegram bot");
      createBot(this);
    }
  
    if (nconf.get("WEB")) {
      debug("Starting GraphQL API");
      createWebServer(this);
    }
  
    this.keepalive()
  }

  async _initBluetooth() {
    const bluetooth = await bt.initBluetooth()
    await bt.startScan(bluetooth);

    bluetooth.on("discover", async device => {
      if (playbulb.isPlaybulb(device)) {
        const { name, handle } = playbulb.getConfig(device);
        debug("Playbulb found:", name);
        try {
          await bt.connect(device);
        } catch (err) {
          console.error(chalk.red(err));
        }
        
        this.devices.push(device);
        debug(`Connected to ${name} (${this.devices.length} devices total)`);
  
        if (!this.color) {
          const buffer = await bt.read(device, handle);
          const color = [...buffer];
          debug("Read current color:", color);
          this.color = color
        }
      }
    });
  }

  async keepalive() {
    while (true) {
      await sleep(nconf.get("KEEPALIVE_INTERVAL"));
  
      const connectedDevices = filter(
        device => device.state === "connected",
        this.devices
      );
  
      const otherDevices = filter(
        device => device.state !== "connected",
        this.devices
      );
  
      if (size(connectedDevices)) {
        debug(`Connected to ${size(connectedDevices)} devices:`)
        for (const device of connectedDevices) {
          debug(`* ${playbulb.getName(device)}`)
        }
      }
  
      if (size(otherDevices)) {
        debug(`Other ${size(otherDevices)} devices visible:`)
        for (const device of otherDevices) {
          debug(`* ${playbulb.getName(device)}`)
        }
      }
  
      otherDevices.forEach(async device => {
        debug(
          `Device ${playbulb.getName(device)} is not connected, trying to reconnect...`
        );
        await bt.connect(device);
        debug(`Connected to ${playbulb.getName(device)} (${this.devices.length} devices total)`);
      });
  
      debug(`Next scan in ${ms(nconf.get("KEEPALIVE_INTERVAL"))}`);
    }
  }

  setColor(color) {
    debug('Setting color to', color)
    clearInterval(this.gradientLoop)
    this.mode = Svet.MODE.color
    this.color = color
    this._setColor()
  }

  _setColor() {
    this._setAllColors(this.color)
  }

  setGradient(from, to, steps = 100, speed = 10000) {
    debug(`Starting to rotate between ${from} to ${to} in ${steps} steps every ${ms(speed)}.`)
    clearInterval(this.gradientLoop)
    this.mode = Svet.MODE.gradient
    this.gradient = { from, to, steps, speed }
    this._setGradient()
  }

  _setGradient() {
    let step = 0
    const { from, to, steps, speed } = this.gradient
    const scale = chroma.scale([from, to]).domain([0, steps])
    
    this._setAllColors(scale(step))

    this.gradientLoop = setInterval(() => {
      if (step < steps) {
        step += 1
      } else {
        step -= 1
      }
      const current = scale(step)

      this._setAllColors(current)
      this.gradient = { ...this.gradient, current, step }
    }, speed)
  }

  toggle(value) {
    this.on = value

    switch(this.mode) {
      case Svet.MODE.gradient:
        if (value) {
          this._setGradient()
        } else {
          clearInterval(this.gradientLoop)
          this._setAllColors([0 ,0, 0])
        }
        break;
      case Svet.MODE.color:
      default:
        if (value) {
          this._setColor()
        } else {
          this._setAllColors([0 ,0, 0])
        }
        break;
    }
  }

  _setAllColors(color) {
    color = chroma(color || nconf.get("DEFAULT_COLOR"))
    debug('Setting all colors to', color.toString())

    this.devices.forEach(async device => {
      if (device.state !== "connected") {
        debug(
          `Device ${playbulb.getName(device)} is not connected, trying to reconnect...`
        );
        await bt.connect(device);
        debug(`Reconnected to ${playbulb.getName(device)}.`);
      }

      const { handle } = playbulb.getConfig(device);
      const finalColor = [0, ...color.rgb()]
      bt.write(device, handle, finalColor);
    });
  }
}

clearScreen();
new Svet();