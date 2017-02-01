const config = require('config');
const path = require('path');

module.exports = {
  upload: {
    username: config.username,
    password: config.password,
    file: path.resolve(__dirname, 'dog_pilot.jpg')
  }
};
