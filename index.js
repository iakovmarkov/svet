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
    this.recents = []
    this.gradient = {}
    this.mode = Svet.MODE.color
    this.color = nconf.get('DEFAULT_COLOR')
    this.on = false
    this.noble = null

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
    this.noble = await bt.initBluetooth()
    await bt.startScan(this.noble);

    this.noble.on("discover", async device => {
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
  
        if (!this.color || this.color === nconf.get('DEFAULT_COLOR')) {
          const buffer = await bt.read(device, handle);
          const color = [...buffer];
          debug("Read current color:", color);
          this.color = color
        }
      }
    });
  }

  async reconnect () {
    const connectedDevices = [];
    const disconnectedDevices = this.devices.filter(device => device.state !== "connected");

    await sleep(500);
    bt.startScan(this.noble);
    await sleep(5000);

    if (disconnectedDevices.length > 0) {
      debug(
        `Trying to reconnect to ${disconnectedDevices.length} devices: ${disconnectedDevices.map(device => playbulb.getName(device))}...`
      );

      debug(`Let's go!`);
      await Promise.all(
        disconnectedDevices.map(
          device =>
            new Promise(async (resolve, reject) => {
              try {
                await bt.connect(device);
              } catch (err) {
                debug(`Error connecting to device ${playbulb.getName(device)}: ${err}`);
                reject(err);
              }
              debug(`Reconnected to ${playbulb.getName(device)} (state=${device.state})`);
              connectedDevices.push(playbulb.getName(device));
              resolve();
            })
        )
      );

      if (connectedDevices.length) {
        return (
          `Connected to ${connectedDevices.length} new devices: ${connectedDevices.join(
            ", "
          )}`
        );
      } else {
        return ("Couldn't reconnect to any device :(");
      }

    } else {
      return ('Everything is connected!')
    }
  }

  async keepalive() {
    while (true) {
      await sleep(nconf.get("KEEPALIVE_INTERVAL"));
      const color = this.on
        ? [0, ...chroma(this.color || nconf.get("DEFAULT_COLOR")).rgb()]
        : [0, 0, 0, 0]
  
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

        try {
          await bt.connect(device);

          const { handle } = playbulb.getConfig(device);
          await bt.write(device, handle, color);
          
          debug(`Connected to ${playbulb.getName(device)} (${this.devices.length} devices total)`);
        } catch (e) {
          debug(`Couldn't connect to ${playbulb.getName(device)} (${this.devices.length} devices total)`);
        }
      });
  
      debug(`Next scan in ${ms(nconf.get("KEEPALIVE_INTERVAL"))}`);
    }
  }

  addToRecents(item) {
    this.recents.push(item)
    if (this.recents.length > nconf.get('RECENTS_SIZE')) {
      this.recents = this.recents.slice(this.recents.length - nconf.get('RECENTS_SIZE'), nconf.get('RECENTS_SIZE'))
    }
  }

  setColor(color) {
    debug('Setting color to', color)
    clearInterval(this.gradientLoop)
    this.addToRecents({ type: 'color', color: chroma(color).toString() })
    this.mode = Svet.MODE.color
    this.color = color
    this.on = true
    this._setColor()
  }

  _setColor() {
    this._setAllColors(this.color)
  }

  setGradient(from, to, steps = 100, speed = 10000) {
    const gradient = { from, to, steps, speed }
    debug(`Starting to rotate between ${from} to ${to} in ${steps} steps every ${ms(speed)}.`)
    this.addToRecents({ type: 'gradient', gradient })
    clearInterval(this.gradientLoop)
    this.mode = Svet.MODE.gradient
    this.gradient = gradient
    this.on = true
    this._setGradient()
  }

  _setGradient() {
    let delta = 1
    this.gradient.step = 0
    const { from, to, steps, speed } = this.gradient
    const scale = chroma.scale([from, to]).domain([0, steps])
    
    this._setAllColors(scale(this.gradient.step))

    this.gradientLoop = setInterval(() => {
      this.gradient.step = this.gradient.step + delta
      if (this.gradient.step === steps) {
        delta = -1
      } else if (this.gradient.step === 0) {
        delta = 1
      }
      
      const current = scale(this.gradient.step)

      this._setAllColors(current)
      this.gradient = { ...this.gradient, current }
      this.color = current
    }, speed)
  }

  toggle(value) {
    this.on = value
    clearInterval(this.gradientLoop)

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