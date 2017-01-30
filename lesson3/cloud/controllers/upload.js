var multer  = require('multer');
var fs = require('fs');
var config = require('config');
var log = require('../log');

var uploadMiddleware = multer({
  fileFilter: fileFilter,
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, config.uploadDestination);
    },
    filename: realFileName,
  }),
});

var FILES_LIST_PATH = config.filesListPath;
var FILERECORDSPLITTER = config.filesRecordSplitter;
var filesList = [];

try {
  filesList = fs.readFileSync(FILES_LIST_PATH, 'utf8').split(FILERECORDSPLITTER).map((file) => {
    return file.split(',');
  });

  log.info('FileList loaded at start');
} catch (err) {
  log.info('No fileList found at start');
}

function fileFilter(req, file, cb) {
  let filePath = req.query.filePath;
  let fileModTime = req.query.fileModTime;
  let fileExist = false;
  let fileUpdateTime = false;
  let fileIndex = -1;

  fileExist = filesList.some((fileData, index) => {
    if (fileData[0] === filePath) {
      fileUpdateTime = fileData[1];
      fileIndex = index;
      return true;
    }

    return false;
  });

  console.log(fileExist, fileUpdateTime, fileModTime, fileUpdateTime >= fileModTime);

  if (fileExist && fileUpdateTime >= fileModTime) {
    cb(null, false);
  } else {

    filesList[fileIndex] = [filePath, fileModTime];
    saveToFileList(filesList[fileIndex], function(err) {
      cb(err, true);
    });
  }
}

function validateRequest() {
  return function(req, res, next) {
    var filePath = req.query.filePath;
    if (!filePath) {
      var err = new Error('Validation error: filePath parameter is missing');
      err.code = 400;
      return next(err);
    }
    next();
  }
}

function saveToFileList(filePath, cb) {
  try {
    filesList.push(filePath);
    console.log(filesList);
    var fileRecord = prepareDataToRecors(filesList);
    console.log(fileRecord);
    fs.writeFileSync(FILES_LIST_PATH, fileRecord);
  } catch (err) {
    return cb(err);
  }
  log.debug('File saved to list', filePath);
  return cb();
}

function realFileName(req, file, cb) {
  cb(null, file.originalname);
}

function prepareDataToRecors(files) {
  return files.map((fileData) => {
    return fileData.join(',');
  }).join(FILERECORDSPLITTER);
}

module.exports = {
  parse: uploadMiddleware,
  validate: validateRequest
};
