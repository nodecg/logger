/* jshint -W030 */
'use strict';

var fs = require('fs');
var sinon = require('sinon');
var rimraf = require('rimraf');
var chai = require('chai');
var expect = chai.expect;
chai.should();

// Start up the logger lib with defaults only
var Logger = require('../index')();

before(function () {
    // Remove the "logs" folder
    if (fs.existsSync('./logs')) {
        rimraf.sync('./logs');
    }

    this.logger = new Logger('testLogger');
});

describe('console logger', function () {
    it('should default to being silent', function () {
        Logger._winston.transports.nodecgConsole.silent.should.equal(true);
    });

    it('should default to level "info"', function () {
        Logger._winston.transports.nodecgConsole.level.should.equal('info');
    });

    it('should change settings when reconfigured', function () {
        Logger.globalReconfigure({
            console: {
                enabled: true,
                level: 'debug'
            }
        });

        Logger._winston.transports.nodecgConsole.silent.should.equal(false);
        Logger._winston.transports.nodecgConsole.level.should.equal('debug');
    });
});

describe('file logger', function () {
    it('should default to being silent', function () {
        Logger._winston.transports.nodecgFile.silent.should.equal(true);
    });

    it('should default to level "info"', function () {
        Logger._winston.transports.nodecgFile.level.should.equal('info');
    });

    it('should change settings when reconfigured', function () {
        Logger.globalReconfigure({
            file: {
                path: 'logs/test.log',
                enabled: true,
                level: 'debug'
            }
        });

        Logger._winston.transports.nodecgFile.filename.should.equal('logs/test.log');
        Logger._winston.transports.nodecgFile.silent.should.equal(false);
        Logger._winston.transports.nodecgFile.level.should.equal('debug');
    });

    it('should make the logs folder', function () {
        expect(fs.existsSync('./logs')).to.equal(true);
    });
});

describe('replicant logging', function () {
    it('should default to false', function () {
        Logger._shouldLogReplicants.should.equal(false);
    });

    it('should do nothing when Logger._shouldLogReplicants is false', function() {
        sinon.spy(Logger._winston, 'info');
        this.logger.replicants('replicants');
        Logger._winston.info.called.should.equal(false);
        Logger._winston.info.restore();
    });

    it('should change settings when reconfigured', function () {
        Logger.globalReconfigure({
            replicants: true
        });

        Logger._shouldLogReplicants.should.equal(true);
    });
});

describe('logging methods', function () {
    it('should all prepend the instance name to the output', function () {
        var self = this;
        ['trace', 'debug', 'info', 'warn', 'error'].forEach(function(level) {
            sinon.spy(Logger._winston, level);
            self.logger[level](level);
            Logger._winston[level].getCall(0).args[0].should.equal('[testLogger]');
            Logger._winston[level].getCall(0).args[1].should.equal(level);
            Logger._winston[level].restore();
        });

        // Replicants has to be tested differently than the others
        sinon.spy(Logger._winston, 'info');
        self.logger.replicants('replicants');
        Logger._winston.info.getCall(0).args[0].should.equal('[testLogger]');
        Logger._winston.info.getCall(0).args[1].should.equal('replicants');
        Logger._winston.info.restore();
    });
});
