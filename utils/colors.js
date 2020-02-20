const chroma = require('chroma-js')
const colors = require('../app/src/shared/colors')

const findColor = colorName =>
  colors.reduce((res, curr) => {
    if (res) {
      return res;
    }
    const { color, name } = curr;
    if (name.toLowerCase() === colorName.toLowerCase()) {
      return chroma(color).rgb()
    }
  }, null);

module.exports = {
  colors,
  findColor,
};
