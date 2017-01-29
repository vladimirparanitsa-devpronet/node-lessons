const spawn = require('child-process-promise').spawn;
const path = require('path');
const expect = require('chai').expect;
const VALID_FILE_PATH = '../../README.md';
const INVALID_FILE_PATH = '../../README123.md';
const PASSWORD_PROMPT = 'Enter password:';
const VALID_USER = 'qwe';
const SHORT_PASSWORD = 'short';
const VALID_PASSWORD = 'securepass';
const PASSWORD_MIN_LENGTH = 6;
const SERVER_DOWN_ERROR = 'connect ECONNREFUSED 127.0.0.1:3000';
const SHORT_PASSWORD_ERROR = 'Password should have length more than ' + PASSWORD_MIN_LENGTH;
const NO_FILE_ERROR_PART = 'ENOENT: no such file or directory';
const MOCK_FILE_PATH = '../mock/mockFile';
const PATH_MESSAGE = 'filePathQuery generated ';
const SYNC_MESSAGE_START = 'Trying to sync file ';
const SYNC_MESSAGE_END = ' with size 26';


describe('Upload', function() {
  it('should ask a password', function(done) {
    const command = spawn(
      'filesync', ['-u', VALID_USER, VALID_FILE_PATH],
      { capture: [ 'stdout', 'stderr' ]}
    );
    const childProcess = command.childProcess;
    childProcess.stdout.on('data', function handler(data) {
      const stdout = data.toString().trim();
      expect(stdout).to.equal(PASSWORD_PROMPT);
      childProcess.stdout.removeListener('data', handler);
      done();
    });
  });


  it('should give error on short password', function(done) {
    const command = spawn('filesync', ['-u', VALID_USER, VALID_FILE_PATH], { capture: [ 'stdout', 'stderr' ]});
    const childProcess = command.childProcess;
    let askedPassword = false;
    childProcess.stdout.on('data', function handler(data) {
      if (!askedPassword) {
        askedPassword = true;
        childProcess.stdin.write(SHORT_PASSWORD + '\n');
      } else {
        const stdout = data.toString().trim();
        expect(stdout).to.equal(SHORT_PASSWORD_ERROR);
        childProcess.stdout.removeListener('data', handler);
        done();
      }
    });
  });


  it('should give error if file not found', function(done) {
    const command = spawn('filesync', ['-u', VALID_USER, INVALID_FILE_PATH], { capture: [ 'stdout', 'stderr' ]})
      .catch(err => {
        expect(err.stderr.includes(NO_FILE_ERROR_PART)).to.equal(true);
        done();
      });
    const childProcess = command.childProcess;
    childProcess.stdout.on('data', function handler() {
      childProcess.stdin.write(VALID_PASSWORD + '\n');
      childProcess.stdout.removeListener('data', handler);
    });
  });


  it('should give error if server is down', function(done) {
    const command = spawn('filesync', ['-u', VALID_USER, VALID_FILE_PATH], { capture: [ 'stdout', 'stderr' ]})
      .catch(err => {
        expect(err).to.be.empty();
        done();
      });

    const childProcess = command.childProcess;

    childProcess.stdout.on('data', function handler() {
      childProcess.stdin.write(VALID_PASSWORD + '\n');
      childProcess.stdout.removeListener('data', handler);
    });

    childProcess.stderr.on('data', function errorHandler(data) {
      const stderr = data.toString().trim();
      expect(stderr).to.equal(SERVER_DOWN_ERROR);
      childProcess.stderr.removeListener('data', errorHandler);
      done();
    });
  });


  describe('success should ', function() {
    it('show try sync message', function(done) {
      let filePath = path.resolve(__dirname, MOCK_FILE_PATH);
      const command = spawn('filesync', ['-u', VALID_USER, filePath], { capture: [ 'stdout', 'stderr' ]})
        .catch(err => {
          expect(err).to.be.empty();
          done();
        });
      const childProcess = command.childProcess;
      let passEntered = 0;

      childProcess.stdout.on('data', function handler(data) {
        const stdout = data.toString().trim();
        switch (passEntered) {
          case 0:
            childProcess.stdin.write(VALID_PASSWORD + '\n');
            break;
          case 1:
              expect(stdout).to.equal(SYNC_MESSAGE_START + filePath + SYNC_MESSAGE_END);
              childProcess.stdout.removeListener('data', handler);
              done();
              return;
            break;
        }

        passEntered++;
      });
    });


    it('show proper file path', function(done) {
      let filePath = path.resolve(__dirname, MOCK_FILE_PATH);
      const command = spawn('filesync', ['-u', VALID_USER, filePath], { capture: [ 'stdout', 'stderr' ]})
        .catch(err => {
          expect(err).to.be.empty();
          done();
        });

      const childProcess = command.childProcess;
      let passEntered = 0;

      childProcess.stdout.on('data', function handler(data) {
        switch (passEntered) {
          case 0:
            childProcess.stdin.write(VALID_PASSWORD + '\n');
            break;
          case 1:
            break;
          case 2:
            const stdout = data.toString().trim();
            expect(stdout).to.equal(PATH_MESSAGE + filePath);
            childProcess.stdout.removeListener('data', handler);
            done();
        }

        passEntered++;
      });

      childProcess.stderr.on('data', function errorHandler(data) {
        const stderr = data.toString().trim();
        expect(stderr).to.be.empty();
        childProcess.stderr.removeListener('data', errorHandler);
        done();
      });
    });

    it('show sync success result message', function(done) {
      let filePath = path.resolve(__dirname, MOCK_FILE_PATH);
      const command = spawn('filesync', ['-u', VALID_USER, filePath], { capture: [ 'stdout', 'stderr' ]});
      const childProcess = command.childProcess;
      let passEntered = 0;

      childProcess.stdout.on('data', function handler(data) {

        const stdout = data.toString().trim();
        switch (passEntered) {
          case 0:
            childProcess.stdin.write(VALID_PASSWORD + '\n');
            break;
          case 1 || 2:
            break;
          case 3:
            expect(stdout).to.equal(PATH_MESSAGE + filePath);
            childProcess.stdout.removeListener('data', handler);
            done();
            return;
        }

        passEntered++;
      });

      childProcess.stderr.on('data', function errorHandler(data) {
        const stderr = data.toString().trim();
        expect(stderr).to.be.empty();
        childProcess.stderr.removeListener('data', errorHandler);
        done();
      });
    });
  });
});
