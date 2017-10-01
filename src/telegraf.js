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

  bot.command('help', ctx => {
    ctx.reply(`
/help - This help message
/on - Turns on all lights
/off - Turns off all lights
/set - Sets the lights to specified color
    `)
  })

  bot.on('message', ctx => {
    const arr = pipe(get(['message', 'text']), split(' '), map(Number))(ctx)

    if (arr.length !== 4) {
      ctx.reply(
        'I need you to specify 4 arguments - White, Red, Green & Blue components of color. Please, try again.'
      )
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
