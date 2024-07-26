const path = require('path');

module.exports = {
  entry: {
    content: './content.js',
    popup: './popup.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '')
  },
  mode: 'production'
};