const request = require('./test').request;
const expect = require('chai').expect;
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const config = require('config');
const debug = require('debug')('test:integration:upload');
const testData = require('./resources/testData').upload;
const DEFAULT_FILES_IN_UPLOAD_FOLDER = 1;
const FILELIST_PATH = path.resolve(config.filesListPath);
const UPLOAD_FOLDER = path.resolve(config.uploadDestination);
const UPLOAD_FOLDER_EXCLUDE = [ '.gitkeep' ];
const {
  file,
  username,
  password,
  wrongPassword = 'qwe',
  wrongUploadUrl = '/upload',
} = testData;
const CORRECT_UPLOAD_URL = '/upload?filePath=' + encodeURI(file);

describe('Upload', function() {

  before(function() {
    debug('Started with config', config);
    return clearUploadFolder();
  });

  after(function() {
    return clearUploadFolder();
  });

  it('should get 400 error without mandatory qs and not upload the file', function() {
    const fileStream = fs.createReadStream(file);

    return request
      .post(wrongUploadUrl)
      .auth(username, password)
      .type('form')
      .attach('syncfile', fileStream)
      .set('Connection', 'keep-alive')
      .expect(400)
      .then(function(){
        return checkUploadResults(0);
      });
  });

  it('should get 401 error with wrong credentials and not upload the file', function() {
    const fileStream = fs.createReadStream(file);

    return request
      .post(CORRECT_UPLOAD_URL)
      .auth(username, wrongPassword)
      .type('form')
      .attach('syncfile', fileStream)
      .set('Connection', 'keep-alive')
      .expect(401)
      .then(function(){
        return checkUploadResults(0);
      });
  });

  it('should upload non-synced file', function() {
    const fileStream = fs.createReadStream(file);
    return request
      .post(CORRECT_UPLOAD_URL)
      .auth(username, password)
      .type('form')
      .attach('syncfile', fileStream)
      .expect(200)
      .then(function(response){
        return Promise.all([
          expect(response.body.duplicate).to.equal(false),
          checkUploadResults(1, true, file)
        ]);
      });
  });

  it('should not upload already synced file but response 200', function() {
    const fileStream = fs.createReadStream(file);
    return request
      .post(CORRECT_UPLOAD_URL)
      .auth(username, password)
      .type('form')
      .attach('syncfile', fileStream)
      .expect(200)
      .then(function(response){
        return Promise.all([
          expect(response.body.duplicate).to.equal(true),
          checkUploadResults(1, true, file)
        ]);
      });
  });

});

function clearUploadFolder() {
  return Promise.all([ ensureNoFilesInFolder(), ensureNoFilesList() ])
    .then(function() {
      debug('Upload destination cleaned and ready for testing');
    });
}

function ensureNoFilesInFolder() {
  return fs.readdirAsync(UPLOAD_FOLDER)
    .then(files => removeUnwantedFiles(files))
    .then(() => fs.readdirAsync(config.uploadDestination))
    .then(files => {
      if (files.length !== DEFAULT_FILES_IN_UPLOAD_FOLDER) {
        throw new Error('Wrong default files length in upload folder after cleanup ' + files.length);
      }
    });
}

function removeUnwantedFiles(files) {
  return Promise.all(files.map(function(file) {
    return !UPLOAD_FOLDER_EXCLUDE.includes(file)
      && fs.unlinkAsync(path.join(UPLOAD_FOLDER, file));
  }));
}

function ensureNoFilesList() {
  return fs.statAsync(FILELIST_PATH)
    .catch(function(){
      return false;
    })
    .then(function(stats) {
      return stats && fs.unlinkAsync(FILELIST_PATH);
    });
}

function checkUploadResults(num, filesListExists, lastFilePath) {
  const filesInFolder = DEFAULT_FILES_IN_UPLOAD_FOLDER + num;
  const recordsInFileList = num;
  return fs.readdirAsync(config.uploadDestination)
    .then(function(files) {
      return expect(files.length).to.equal(filesInFolder);
    })
    .then(function() {
      return filesListExists && getFilesList();
    })
    .then(function(filesList){
      return filesList && Promise.all([
        filesListExists && expect(filesList.length).to.equal(recordsInFileList),
        lastFilePath && expect(filesList[filesList.length - 1]).to.equal(lastFilePath)
      ]);
    });
}

function getFilesList() {
  return fs
    .readFileSync(FILELIST_PATH, 'utf8')
    .trim()
    .split(config.filesRecordSplitter);
}
