/* eslint-disable */
const { green } = require('chalk')

const clearScreen = () => {
  if (process.env.DEBUG && ~process.env.DEBUG.indexOf('svet')) {
    process.stdout.write('\033c')
    console.log('Starting', green('svet'), '\n')
  }
}

module.exports = clearScreen
