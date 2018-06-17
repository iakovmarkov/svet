const { red } = require('chalk')
const debug = require('debug')('svet:main')

const clearScreen = require('./clearScreen')
const {
  initBluetooth,
  startScan,
  connect,
  read
} = require('./bluetoothController')
const { isPlaybulb, getConfig } = require('./playbulbConfig')
const createBot = require('./telegraf')
const createWeb = require('./server')
const keepalive = require('./keepalive')

const nconf = require('./config')

function State (initialState) {
  this.bt = initialState.bt
  this.devices = initialState.devices
  this.on = initialState.on
  this.color = initialState.color

  this.set = (prop, value) => {
    this[prop] = value
  }
}

const main = async () => {
  const state = new State({
    bt: null,
    devices: [],
    on: undefined,
    color: undefined
  })

  state.set('bt', await initBluetooth())

  state.bt.on('discover', async device => {
    if (isPlaybulb(device)) {
      const { name, color: handle } = getConfig(device)
      debug('Playbulb found:', name)
      try {
        await connect(device)
      } catch (err) {
        console.error(red(err))
      }

      debug('Connected to', name)
      state.devices.push(device)
      if (!state.color) {
        const buffer = await read(device, handle)
        const color = [...buffer]

        debug('Read current color:', color)

        state.set('color', color)
        state.set('on', true)
      }
    }
  })

  await startScan(state.bt)

  if (nconf.get('bot')) {
    debug('Starting Telegram bot')
    createBot(state)
  }

  if (nconf.get('web')) {
    debug('Starting GraphQL API')
    createWeb(state)
  }

  keepalive(state)
}

clearScreen()
main()
