const nconf = require('nconf')
const path = require('path')

const DEFAULTS = {
  DEFAULT_COLOR: [255, 0, 0, 0],
  KEEPALIVE_INTERVAL: 60 * 100 // 6 seconds
}

nconf
  .env()
  .file({ file: path.resolve(__dirname, '..', '.env') })
  .defaults(DEFAULTS)

module.exports = nconf
