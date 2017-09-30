const debug = require('debug')('svet:telegraf')
const Telegraf = require('telegraf')
const { get, includes, pipe, split, map, size } = require('lodash/fp')
const { write } = require('./bluetoothController')
const { getConfig } = require('./playbulbConfig')
const { findColor } = require('./color')
const nconf = require('./config')

const TOKEN = nconf.get('TOKEN')
const ALLOWED_USERS = nconf.get('ALLOWED_USERS')
const DEFAULT_COLOR = nconf.get('DEFAULT_COLOR')

const setAllColors = (devices, newColor) => {
  devices.forEach(device => {
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
  if (size(devices)) {
    next()
  } else {
    debug('Not connected to any device.')
    ctx.reply(`Oops, I think I'm not connected to any Playbulb`)
  }
}

const createBot = (bt, devices) => {
  const bot = new Telegraf(TOKEN)
  let currentColor = DEFAULT_COLOR

  bot.use(authMiddleware)
  bot.use(devicesMiddleware(devices))

  bot.command('start', ctx => {
    ctx.reply(
      "Hi! Please, send me 4 digits from 0 to 255, and I'll change colors of all lights to this value."
    )
  })

  bot.command('off', ctx => {
    ctx.reply('Turning off all lights.')

    setAllColors(devices, [0, 0, 0, 0])
  })

  bot.command('on', ctx => {
    ctx.reply('Turning lights back on')

    setAllColors(devices, currentColor)
  })

  bot.command('set', ctx => {
    const color = ctx.message.text.replace('/set ', '')
    const arr = findColor(color)
    if (arr) {
      setAllColors(devices, arr)
    } else {
      ctx.reply(`Sorry, I couldn't find any match for ${color} :(`)
    }
  })

  bot.on('message', ctx => {
    const arr = pipe(get(['message', 'text']), split(' '), map(Number))(ctx)

    if (arr.length !== 4) {
      ctx.reply('pls 4')
      return
    }

    currentColor = arr
    setAllColors(devices, currentColor)

    ctx.reply(arr)
  })

  bot.startPolling()

  return bot
}

module.exports = createBot
