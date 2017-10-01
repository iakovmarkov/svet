const debug = require('debug')('svet:telegraf')
const Telegraf = require('telegraf')
const {
  get,
  includes,
  pipe,
  split,
  map,
  size,
  join,
  slice,
  omit,
  filter
} = require('lodash/fp')
const { write, connect } = require('./bluetoothController')
const { getConfig } = require('./playbulbConfig')
const { findColor, colors } = require('./color')
const nconf = require('./config')

const TOKEN = nconf.get('TOKEN')
const ALLOWED_USERS = nconf.get('ALLOWED_USERS')
const DEFAULT_COLOR = nconf.get('DEFAULT_COLOR')

const getName = get(['advertisement', 'localName'])

const setAllColors = async (devices, newColor) => {
  devices.forEach(async device => {
    if (device.state !== 'connected') {
      debug(
        `Device ${getName(device)} is not connected, trying to reconnect...`
      )
      debug(omit('_noble', device))
      await connect(device)
      debug(`Reconnected to ${getName(device)}.`)
    }
    const { color } = getConfig(device)
    write(device, color, newColor)
  })
}

const authMiddleware = (ctx, next) => {
  const username = get(['from', 'username'])(ctx)
  const shouldRespond = includes(username, ALLOWED_USERS)

  if (shouldRespond) {
    next()
  } else {
    debug(`User ${username} isn't in allowed_usernames; Dropping message.`)
    ctx.reply(`I don't know you, go away!`)
  }
}

const devicesMiddleware = devices => (ctx, next) => {
  const isServiceMessage = pipe(
    get(['message', 'text']),
    split(' '),
    get(0),
    command => includes(command, ['/restart', '/reconnect'])
  )(ctx)

  if (isServiceMessage) {
    next()
  } else {
    const deviceList = filter(device => device.state === 'connected')(devices)
    if (size(deviceList)) {
      next()
    } else {
      debug('Not connected to any device.')
      ctx.reply(`Oops, I think I'm not connected to any Playbulb`)
    }
  }
}

const replyHelp = ctx => {
  ctx.reply(`
/help - This help message
/on - Turns on all lights
/off - Turns off all lights
/set - Sets the lights to specified color
/devices - Lists connected devices
/reconnect - Tries to reconnect to all devices
/colors - Lists known colors
/restart - Restarts the bot and reconnects to all lights
    `)
}

const replyDevices = ctx => {
  const { devices } = ctx
  const deviceList = pipe(
    filter(device => device.state === 'connected'),
    map(device => getName(device))
  )(devices)
  const n = pipe(filter(device => device.state === 'connected'), size)(devices)
  const s = n > 1 ? 's' : ''
  const otherDeviceCount = size(devices) - size(deviceList)
  const otherDevices = otherDeviceCount
    ? ` I also sense ${otherDeviceCount} other devices nearby.`
    : ''
  ctx.reply(
    `I'm connected to ${n} device${s}: ${join(
      ', ',
      deviceList
    )}.${otherDevices}`
  )
}

const replyColors = ctx => {
  const COLORS_PER_MSG = 10
  const n = colors.length
  const colorNames = colors.map(([_, colorName]) => colorName)

  ctx.reply(`Here is the list of all colors I know (${n}):`)

  for (let i = 0; i < n; i += COLORS_PER_MSG) {
    const chunk = pipe(slice(i, i + COLORS_PER_MSG), join(', '))(colorNames)
    ctx.reply(chunk)
  }
}

const replyOff = ctx => {
  const { devices } = ctx

  ctx.reply('Turning off all lights.')

  setAllColors(devices, [0, 0, 0, 0])
}

const replyOn = ctx => {
  const { devices, currentColor } = ctx
  ctx.reply('Turning lights back on')

  setAllColors(devices, currentColor)
}

const replySet = ctx => {
  const { devices } = ctx
  const color = ctx.message.text.replace('/set ', '')
  const arr = findColor(color)
  if (arr) {
    setAllColors(devices, arr)
    ctx.currentColor = arr
    ctx.reply(`Set the colors to ${color}`)
  } else {
    ctx.reply(`Sorry, I couldn't find any match for ${color} :(`)
  }
}

const replyGeneric = ctx => {
  const { devices } = ctx
  const arr = pipe(get(['message', 'text']), split(' '), map(Number))(ctx)

  if (arr.length !== 4) {
    ctx.reply(
      'I need you to specify 4 arguments - White, Red, Green & Blue components of color. Please, try again.'
    )
    return
  }

  setAllColors(devices, arr)
  ctx.currentColor = arr

  ctx.reply(`Set the colors to ${join(', ', arr)}`)
}

const replyRestart = ctx => {
  ctx.reply('Goodbye, cruel world.')
  debug("Restart requested. Hope you've got pm2 set up. Goodbye, cruel world.")
  setTimeout(() => process.exit(1), 250)
}

const replyReconnect = async ctx => {
  const { devices } = ctx
  const connectedDevices = []
  const disconnectedDevices = filter(
    device => device.state !== 'connected',
    devices
  )
  ctx.reply(`Trying to reconnect to ${size(disconnectedDevices)} devices.`)
  debug(
    `Trying to reconnect to ${size(
      disconnectedDevices
    )} devices: ${disconnectedDevices.map(device => getName(device))}`
  )
  await Promise.all(
    disconnectedDevices.map(
      device =>
        new Promise(async (resolve, reject) => {
          try {
            await connect(device)
          } catch (err) {
            debug(`Error connecting to device ${getName(device)}: ${err}`)
            ctx.reply(`Sorry, I couldn't connect to ${getName(device)} :(`)
            reject(err)
          }
          debug(`Reconnected to ${getName(device)} (state=${device.state})`)
          connectedDevices.push(getName(device))
          resolve()
        })
    )
  )
  if (connectedDevices.length) {
    ctx.reply(
      `Connected to ${connectedDevices.length} devices: ${connectedDevices.join(
        ', '
      )}`
    )
  } else {
    ctx.reply("Sorry, I couldn't connect to any device :(")
  }
}

const createBot = (bt, devices) => {
  const bot = new Telegraf(TOKEN)
  bot.context.devices = devices
  bot.context.currentColor = DEFAULT_COLOR

  bot.use(authMiddleware)
  bot.use(devicesMiddleware(devices))

  bot.command('help', replyHelp)

  bot.command('devices', replyDevices)

  bot.command('colors', replyColors)

  bot.command('off', replyOff)

  bot.command('on', replyOn)

  bot.command('set', replySet)

  bot.command('restart', replyRestart)

  bot.command('reconnect', replyReconnect)

  bot.on('message', replyGeneric)

  bot.startPolling()

  return bot
}

module.exports = createBot
