const config = require('../config');//TO-DO: switch to config module
const basic = require('basic-auth');
const router = require('express').Router();
const uploadCtrl = require('../controllers/upload');
const log = require('../log');

router.post('/upload',
  basicAuth(),
  uploadCtrl.validate(),
  uploadCtrl.parse.single('syncfile'),
  function(req, res) {
    log.verbose(req.file ? 'Uploaded' : 'Duplicate', req.query.filePath);
    res.status(200).json({ duplicate: !req.file });
  }
);

function basicAuth() {
  return function(req, res, next) {
    const creds = basic(req);
    if (!creds || creds.name !== config.username || creds.pass !== config.password) {
      log.error('Not Authorized', creds.username);
      res.status(401).json('Not Authorized');
    } else {
      log.debug('Authorized', creds.username);
      return next();
    }
  };
}


module.exports = router;
