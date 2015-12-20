/* jshint -W030 */
'use strict';

var fs = require('fs');
var sinon = require('sinon');
var rimraf = require('rimraf');
var chai = require('chai');

chai.use(require('chai-string'));
var expect = chai.expect;

// Start up the logger lib with defaults only
var Logger = require('../index')();

describe('server', function() {
    before(function () {
        // Remove the "logs" folder
        if (fs.existsSync('./logs')) {
            rimraf.sync('./logs');
        }

        this.logger = new Logger('testServer');
    });

    describe('console logger', function () {
        it('should default to being silent', function () {
            expect(Logger._winston.transports.nodecgConsole.silent).to.equal(true);
        });

        it('should default to level "info"', function () {
            expect(Logger._winston.transports.nodecgConsole.level).to.equal('info');
        });

        it('should change settings when reconfigured', function () {
            Logger.globalReconfigure({
                console: {
                    enabled: true,
                    level: 'debug'
                }
            });

            expect(Logger._winston.transports.nodecgConsole.silent).to.equal(false);
            expect(Logger._winston.transports.nodecgConsole.level).to.equal('debug');
        });
    });

    describe('file logger', function () {
        it('should default to being silent', function () {
            expect(Logger._winston.transports.nodecgFile.silent).to.equal(true);
        });

        it('should default to level "info"', function () {
            expect(Logger._winston.transports.nodecgFile.level).to.equal('info');
        });

        it('should change settings when reconfigured', function () {
            Logger.globalReconfigure({
                file: {
                    path: 'logs/test.log',
                    enabled: true,
                    level: 'debug'
                }
            });

            expect(Logger._winston.transports.nodecgFile.filename).to.equal('logs/test.log');
            expect(Logger._winston.transports.nodecgFile.silent).to.equal(false);
            expect(Logger._winston.transports.nodecgFile.level).to.equal('debug');
        });

        it('should make the logs folder', function () {
            expect(fs.existsSync('./logs')).to.equal(true);
        });
    });

    describe('replicant logging', function () {
        it('should default to false', function () {
            expect(Logger._shouldLogReplicants).to.equal(false);
        });

        it('should do nothing when Logger._shouldLogReplicants is false', function() {
            sinon.spy(Logger._winston, 'info');
            this.logger.replicants('replicants');
            expect(Logger._winston.info.called).to.equal(false);
            Logger._winston.info.restore();
        });

        it('should change settings when reconfigured', function () {
            Logger.globalReconfigure({
                replicants: true
            });

            expect(Logger._shouldLogReplicants).to.equal(true);
        });
    });

    describe('logging methods', function () {
        it('should all prepend the instance name to the output', function () {
            var self = this;
            ['trace', 'debug', 'info', 'warn', 'error'].forEach(function(level) {
                sinon.spy(Logger._winston, level);
                self.logger[level](level);
                expect(Logger._winston[level].getCall(0).args[0]).to.equal('[testServer] ' + level);
                Logger._winston[level].restore();
            });

            // Replicants has to be tested differently than the others
            sinon.spy(Logger._winston, 'info');
            self.logger.replicants('replicants');
            expect(Logger._winston.info.getCall(0).args[0]).to.equal('[testServer] replicants');
            Logger._winston.info.restore();
        });

        it('should not generate any output when too low a level', function() {
            Logger.globalReconfigure({
                console: {
                    enabled: true,
                    level: 'error'
                }
            });

            sinon.spy(process.stdout, 'write');
            this.logger.trace('warning');
            expect(process.stdout.write.called).to.equal(false);
            process.stdout.write.restore();
        });

        it('should generate any output when of an adequate level', function() {
            Logger.globalReconfigure({
                console: {
                    enabled: true,
                    level: 'trace'
                }
            });

            sinon.spy(process.stdout, 'write');
            this.logger.trace('info');
            expect(process.stdout.write.getCall(0).args[0]).to.startWith(
                '\u001b[32mtrace\u001b[39m: [testServer] info'
            );
            process.stdout.write.restore();
        });
    });
});
