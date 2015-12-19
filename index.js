'use strict';

var path = require('path');
var fs = require('fs.extra');
var winston = require('winston');

/**
 * Enum logging level values.
 * @enum {String}
 */
var ENUM_LEVELS = { // jshint ignore:line
    trace: 'The highest level of logging, logs everything.',
    debug: 'Less spammy than trace, includes most info relevant for debugging.',
    info: 'The default logging level. Logs useful info, warnings, and errors.',
    warn: 'Only logs warnings and errors.',
    error: 'Only logs errors.'
};

/**
 * A factory that configures and returns a Logger constructor.
 * @param [initialOpts] {Object} - Configuration for the logger.
 *
 * @param [initialOpts.console] {Object} - Configuration for the console logging.
 * @param [initialOpts.console.enabled=false] {Boolean} - Whether to enable console logging.
 * @param [initialOpts.console.level="info"] {ENUM_LEVELS} - The level of logging to output to the console.
 *
 * @param [initialOpts.file] {Object} - Configuration for file logging.
 * @param initialOpts.file.path {String} - Where the log file should be saved.
 * @param [initialOpts.file.enabled=false] {Boolean} - Whether to enable file logging.
 * @param [initialOpts.file.level="info"] {ENUM_LEVELS} - The level of logging to output to file.
 *
 * @param [initialOpts.replicants=false] {Boolean} - Whether to enable logging specifically for the Replicants system.
 *
 * @returns {function} - A constructor used to create discrete logger instances.
 */
module.exports = function(initialOpts) {
    initialOpts = initialOpts || {};
    initialOpts.console = initialOpts.console || {};
    initialOpts.file = initialOpts.file || {};
    initialOpts.file.path = initialOpts.file.path || 'logs/nodecg.log';

    var consoleTransport = new winston.transports.Console({
        name: 'nodecgConsole',
        prettyPrint: true,
        colorize: true,
        level: initialOpts.console.level || 'info',
        silent: !initialOpts.console.enabled,
        stderrLevels: ['warn', 'error']
    });

    var fileTransport = new winston.transports.File({
        name: 'nodecgFile',
        json: false,
        prettyPrint: true,
        filename: initialOpts.file.path,
        level: initialOpts.file.level || 'info',
        silent: !initialOpts.file.enabled
    });

    winston.addColors({
        trace: 'green',
        debug: 'cyan',
        info: 'white',
        warn: 'yellow',
        error: 'red'
    });

    var mainLogger = new (winston.Logger)({
        transports: [consoleTransport, fileTransport],
        levels: {
            trace: 4,
            debug: 3,
            info: 2,
            warn: 1,
            error: 0
        }
    });

    _configure(initialOpts);

    function _configure(opts) {
        // Initialize opts with empty objects, if nothing was provided.
        opts = opts || {};
        opts.console = opts.console || {};
        opts.file = opts.file || {};

        if (typeof opts.console.enabled !== 'undefined') {
            consoleTransport.silent = !opts.console.enabled;
        }

        if (typeof opts.console.level !== 'undefined') {
            consoleTransport.level = opts.console.level;
        }

        if (typeof opts.file.enabled !== 'undefined') {
            fileTransport.silent = !opts.file.enabled;
        }

        if (typeof opts.file.level !== 'undefined') {
            fileTransport.level = opts.file.level;
        }

        if (typeof opts.file.path !== 'undefined') {
            fileTransport.filename = opts.file.path;
            _makeLogFolderIfItDoesNotExist(opts.file.path);
        }

        if (typeof opts.replicants !== 'undefined') {
            Logger._shouldLogReplicants = opts.replicants;
        }
    }

    function _makeLogFolderIfItDoesNotExist(folderPath) {
        // Make logs folder if it does not exist.
        if (!fs.existsSync(path.dirname(folderPath))) {
            fs.mkdirpSync(path.dirname(folderPath));
        }
    }

    /**
     * Constructs a new Logger instance that prefixes all output with the given name.
     * @param name {String} - The label to prefix all output of this logger with.
     * @returns {Object} - A Logger instance.
     * @constructor
     */
    function Logger(name) {
        this.name = name;
    }

    Logger.prototype = {
        trace: function () {
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            mainLogger.trace.apply(mainLogger, arguments);
        },
        debug: function () {
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            mainLogger.debug.apply(mainLogger, arguments);
        },
        info: function() {
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            mainLogger.info.apply(mainLogger, arguments);
        },
        warn: function() {
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            mainLogger.warn.apply(mainLogger, arguments);
        },
        error: function() {
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            mainLogger.error.apply(mainLogger, arguments);
        },
        replicants: function() {
            if (!Logger._shouldLogReplicants) return;
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            mainLogger.info.apply(mainLogger, arguments);
        }
    };

    Logger.globalReconfigure = function(opts) {
        _configure(opts);
    };

    Logger._winston = mainLogger;

    // A messy bit of internal state used to determine if the special-case "replicants" logging level is active.
    Logger._shouldLogReplicants = Boolean(initialOpts.replicants);

    return Logger;
};
