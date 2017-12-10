const { red } = require('chalk')
const debug = require('debug')('svet:main')

const clearScreen = require('./clearScreen')
const { initBluetooth, startScan, connect } = require('./bluetoothController')
const { isPlaybulb, getConfig } = require('./playbulbConfig')
const createBot = require('./telegraf')
const keepalive = require('./keepalive')

const main = async () => {
  const bt = await initBluetooth()
  const devices = []

  bt.on('discover', async device => {
    if (isPlaybulb(device)) {
      const { name } = getConfig(device)
      debug('Playbulb found:', name)
      try {
        await connect(device)
      } catch (err) {
        console.error(red(err))
      }

      debug('Connected to', name)
      devices.push(device)
    }
  })

  await startScan(bt)

  createBot(bt, devices)
  keepalive(bt, devices)
}

clearScreen()
main()
