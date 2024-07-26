const path = require('path');

module.exports = {
  entry: {
    content: './content.js',
    popup: './popup.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production'
};
