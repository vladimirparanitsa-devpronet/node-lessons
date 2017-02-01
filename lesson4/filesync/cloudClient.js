const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const agent = require('superagent');
const progressBar = require('progress-bar');

const CLOUD_URL = 'localhost:3000/upload';

module.exports = {
  upload: postFileToCloud
};

function postFileToCloud(filePath, username, password) {
  return fs.statAsync(filePath)
    .then(stats => {
      console.log('Trying to sync file', filePath, 'with size', stats.size);
      const bar = progressBar.create(process.stdout);
      const fileStream = fs.createReadStream(filePath);
      const uploadUrl = generateUploadUrl(filePath);
      return agent
        .post(uploadUrl)
        .auth(username, password)
        .type('form')
        .on('progress', function(e) {
          const percentDone = Math.floor((e.loaded / e.total) * 100);
          bar.update(percentDone / 100);
        })
        .attach('syncfile', fileStream)
        .set('Accept', 'application/json');
    });
}

function generateUploadUrl(filePath) {
  const filePathQuery = encodeURI(path.resolve(filePath));
  console.log('filePathQuery generated', filePathQuery);
  return CLOUD_URL + '?filePath=' + filePathQuery;
}
