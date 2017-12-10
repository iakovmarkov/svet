const debug = require('debug')('svet:keepalive')
const nconf = require('./config')

const { connect } = require('./bluetoothController')
const { getName } = require('./playbulbConfig')
const { pipe, filter, map, join, size } = require('lodash/fp')
const ms = require('pretty-ms')

const KEEPALIVE_INTERVAL = nconf.get('KEEPALIVE_INTERVAL')

const sleep = async timeout =>
  new Promise(resolve => setInterval(resolve, timeout))

const keepalive = async (bt, devices) => {
  while (true) {
    await sleep(KEEPALIVE_INTERVAL)

    const connectedDevices = filter(
      device => device.state === 'connected',
      devices
    )
    const otherDevicesCount = size(devices) - size(connectedDevices)

    debug(
      `Connected to ${size(connectedDevices)} devices`,
      size(connectedDevices)
        ? ` (${pipe(map(getName), join(', '))(connectedDevices)}). `
        : '. ',
      otherDevicesCount ? `${otherDevicesCount} visible.` : ''
    )

    devices.forEach(async device => {
      if (device.state !== 'connected') {
        debug(
          `Device ${getName(device)} is not connected, trying to reconnect...`
        )
        await connect(device)
        debug(`Reconnected to ${getName(device)}.`)
      }
    })

    debug(`Next scan in ${ms(KEEPALIVE_INTERVAL)}`)
  }
}

module.exports = keepalive
