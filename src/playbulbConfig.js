// const debug = require('debug')('svet:config')
const { pipe, map, find, includes, matches } = require('lodash/fp')

const configs = [
  {
    name: 'PLAYBULB sphere',
    color: '0x0029'
  },
  {
    name: 'MIPOW SMART BULB',
    color: '0x001b'
  },
  {
    name: 'PLAYBULB comet',
    color: '0x0023'
  }
]

const isPlaybulb = device => {
  const name = device.advertisement.localName
  return pipe(map('name'), names => includes(name, names))(configs)
}

const getConfig = device => {
  const name = device.advertisement.localName
  return find(matches({ name }))(configs)
}

module.exports = {
  isPlaybulb,
  getConfig
}