const chroma = require('chroma-js')
const colors = require('../app/src/shared/colors')

const findColor = colorName =>
  colors.reduce((res, curr) => {
    if (res) {
      return res;
    }
    const [code, name] = curr;
    if (name.toLowerCase() === colorName.toLowerCase()) {
      return chroma(code).rgb()
    }
  }, null);

module.exports = {
  colors,
  findColor,
};
