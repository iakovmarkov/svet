// const debug = require('debug')('svet:config')
const { pipe, map, find, includes, matches } = require('lodash/fp')

const configs = [
  {
    name: 'PLAYBULB sphere',
    color: '0x0029'
  }
]

const isPlaybulb = device => {
  const name = device.advertisement.localName
  return pipe(map('name'), names => includes(names, name))(configs)
}

const getConfig = device => {
  const name = device.advertisement.localName
  return find(matches({ name }))(configs)
}

module.exports = {
  isPlaybulb,
  getConfig
}
