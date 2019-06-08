const nconf = require("nconf");
const path = require("path");

const DEFAULTS = {
  DEFAULT_COLOR: "cream",
  KEEPALIVE_INTERVAL: 30 * 1000,
  PORT: 8080
};

nconf
  .argv()
  .env()
  .file({ file: path.resolve(__dirname, "..", ".env") })
  .defaults(DEFAULTS);

module.exports = nconf;
