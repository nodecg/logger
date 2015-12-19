'use strict';

var LOG_LEVELS = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    _infinite: Infinity
};

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
 * @param [initialOpts.replicants=false] {Boolean} - Whether to enable logging specifically for the Replicants system.
 *
 * @returns {function} - A constructor used to create discrete logger instances.
 */
module.exports = function(initialOpts) {
    initialOpts = initialOpts || {};
    initialOpts.console = initialOpts.console || {};

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
            if (Logger._silent) return;
            if (LOG_LEVELS[Logger._level] > LOG_LEVELS.trace) return;
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            console.info.apply(console, arguments);
        },
        debug: function () {
            if (Logger._silent) return;
            if (LOG_LEVELS[Logger._level] > LOG_LEVELS.debug) return;
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            console.info.apply(console, arguments);
        },
        info: function() {
            if (Logger._silent) return;
            if (LOG_LEVELS[Logger._level] > LOG_LEVELS.info) return;
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            console.info.apply(console, arguments);
        },
        warn: function() {
            if (Logger._silent) return;
            if (LOG_LEVELS[Logger._level] > LOG_LEVELS.warn) return;
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            console.warn.apply(console, arguments);
        },
        error: function() {
            if (Logger._silent) return;
            if (LOG_LEVELS[Logger._level] > LOG_LEVELS.error) return;
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            console.error.apply(console, arguments);
        },
        replicants: function() {
            if (Logger._silent) return;
            if (!Logger._shouldLogReplicants) return;
            Array.prototype.unshift.call(arguments, '[' + this.name + ']');
            console.info.apply(console, arguments);
        }
    };

    Logger.globalReconfigure = function(opts) {
        _configure(opts);
    };

    // Initialize with defaults
    Logger._level = 'info';
    Logger._silent = true;
    Logger._shouldLogReplicants = false;

    _configure(initialOpts);

    function _configure(opts) {
        // Initialize opts with empty objects, if nothing was provided.
        opts = opts || {};
        opts.console = opts.console || {};

        if (typeof opts.console.enabled !== 'undefined') {
            Logger._silent = !opts.console.enabled;
        }

        if (typeof opts.console.level !== 'undefined') {
            Logger._level = opts.console.level;
        }

        if (typeof opts.replicants !== 'undefined') {
            Logger._shouldLogReplicants = opts.replicants;
        }
    }

    return Logger;
};
