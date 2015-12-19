/* jshint -W030 */
'use strict';

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

// Start up the logger lib with defaults only
var Logger = require('../browser')();

describe('client', function() {
    before(function () {
        this.logger = new Logger('testClient');
    });

    describe('console logger', function () {
        it('should default to being silent', function () {
            expect(Logger._silent).to.equal(true);
        });

        it('should default to level "info"', function () {
            expect(Logger._level).to.equal('info');
        });

        it('should change settings when reconfigured', function () {
            Logger.globalReconfigure({
                console: {
                    enabled: true,
                    level: 'debug'
                }
            });

            expect(Logger._silent).to.equal(false);
            expect(Logger._level).to.equal('debug');
        });
    });

    describe('replicant logging', function () {
        it('should default to false', function () {
            expect(Logger._shouldLogReplicants).to.equal(false);
        });

        it('should do nothing when Logger._shouldLogReplicants is false', function() {
            sinon.spy(console, 'info');
            this.logger.replicants('replicants');
            expect(console.info.called).to.equal(false);
            console.info.restore();
        });

        it('should change settings when reconfigured', function () {
            Logger.globalReconfigure({
                replicants: true
            });

            expect(Logger._shouldLogReplicants).to.equal(true);
        });
    });

    describe('logging methods', function () {
        it('should all do nothing when _silent is true', function () {
            Logger._silent = true;
            Logger._level = 'trace';

            // Trace
            sinon.spy(console, 'info');
            this.logger.trace('trace');
            expect(console.info.called).to.equal(false);
            console.info.restore();

            // Debug
            sinon.spy(console, 'info');
            this.logger.debug('debug');
            expect(console.info.called).to.equal(false);
            console.info.restore();

            // Info
            sinon.spy(console, 'info');
            this.logger.info('info');
            expect(console.info.called).to.equal(false);
            console.info.restore();

            // Warn
            sinon.spy(console, 'warn');
            this.logger.warn('warn');
            expect(console.warn.called).to.equal(false);
            console.warn.restore();

            // Error
            sinon.spy(console, 'error');
            this.logger.error('error');
            expect(console.error.called).to.equal(false);
            console.error.restore();

            // Replicants
            sinon.spy(console, 'info');
            this.logger.replicants('replicants');
            expect(console.info.called).to.equal(false);
            console.info.restore();
        });

        it('should all do nothing when the log level is above them', function () {
            Logger._silent = false;
            Logger._level = '_infinite';

            // Trace
            sinon.spy(console, 'info');
            this.logger.trace('trace');
            expect(console.info.called).to.equal(false);
            console.info.restore();

            // Debug
            sinon.spy(console, 'info');
            this.logger.debug('debug');
            expect(console.info.called).to.equal(false);
            console.info.restore();

            // Info
            sinon.spy(console, 'info');
            this.logger.info('info');
            expect(console.info.called).to.equal(false);
            console.info.restore();

            // Warn
            sinon.spy(console, 'warn');
            this.logger.warn('warn');
            expect(console.warn.called).to.equal(false);
            console.warn.restore();

            // Error
            sinon.spy(console, 'error');
            this.logger.error('error');
            expect(console.error.called).to.equal(false);
            console.error.restore();
        });

        it('should all prepend the instance name to the output', function () {
            Logger._level = 'trace';
            Logger._silent = false;

            // Trace
            sinon.spy(console, 'info');
            this.logger.trace('trace');
            expect(console.info.getCall(0).args[0]).to.equal('[testClient]');
            expect(console.info.getCall(0).args[1]).to.equal('trace');
            console.info.restore();

            // Debug
            sinon.spy(console, 'info');
            this.logger.debug('debug');
            expect(console.info.getCall(0).args[0]).to.equal('[testClient]');
            expect(console.info.getCall(0).args[1]).to.equal('debug');
            console.info.restore();

            // Info
            sinon.spy(console, 'info');
            this.logger.info('info');
            expect(console.info.getCall(0).args[0]).to.equal('[testClient]');
            expect(console.info.getCall(0).args[1]).to.equal('info');
            console.info.restore();

            // Warn
            sinon.spy(console, 'warn');
            this.logger.warn('warn');
            expect(console.warn.getCall(0).args[0]).to.equal('[testClient]');
            expect(console.warn.getCall(0).args[1]).to.equal('warn');
            console.warn.restore();

            // Error
            sinon.spy(console, 'error');
            this.logger.error('error');
            expect(console.error.getCall(0).args[0]).to.equal('[testClient]');
            expect(console.error.getCall(0).args[1]).to.equal('error');
            console.error.restore();

            // Replicants
            sinon.spy(console, 'info');
            this.logger.replicants('replicants');
            expect(console.info.getCall(0).args[0]).to.equal('[testClient]');
            expect(console.info.getCall(0).args[1]).to.equal('replicants');
            console.info.restore();
        });
    });
});
