'use strict';

var colors = require('colors'),
    util = require('util'),
    q = require('q');

/**
 * ConsoleTransport class. Transport for the console.
 * @param {Object}  configs An object containing configurations to initialize the Transport
 * @param {Array}   configs.levels A list of levels that the transport has to log. By default every message are logged at each level
 * @param {Boolean} configs.timestamp Flag to allow timestamp in the log. True by default
 * @param {Boolean} configs.colorize Flag to allow colors in the log. True by default
 * @param {Object}  configs.colors A map of level-color. Each level is logged colored by his color
 * @returns {ConsoleTransport} A new ConsoleTransport instance
 * @constructor
 */
function ConsoleTransport (configs) {
    var me = this;

    configs = configs || {};
    me.levels = configs.levels || ['info', 'warning', 'error'];
    me.timestamp = configs.timestamp || true;
    me.colorize = configs.colorize || true;
    me.colors = {
        info: 'green',
        warning: 'yellow',
        error: 'red'
    };

    if (configs.colors) {
        me.colors = configs.colors;
        colors.setTheme(me.colors);
    }

    me.levels.forEach(function (level) {
        me[level] = function (message, metadata, callback) {
            return me.log(level, message, metadata, callback);
        };
    });

    /**
     * It logs a message at the specified level
     * @param {String} level The level the logger has to log
     * @param {String} message The message to log
     * @param {Object} metadata An object containing extra data to log
     * @param {Function} callback A callback function called after logging
     * @returns {Promise} A promise resolved or rejected
     */
    me.log = function (level, message, metadata, callback, deferred) {
        deferred = deferred || q.defer();

        if (me.levels.length === 0 || (me.levels.length > 0 && me.levels.indexOf(level) > -1)) {
            var prefix = me.timestamp ? ('[' + (new Date()).toJSON() + ' - ' + level + ']: ') : ('[' + level + ']: '),
                msg = prefix + message;

            if (metadata) msg += ' ' + util.inspect(metadata);
            if (me.colorize && me.colors[level].length > 0) msg = msg[me.colors[level]];

            console.log(msg);

            if (typeof callback === 'function') callback(null, msg);
            deferred.resolve(msg);
        }

        return deferred.promise;
    };

    return me;
};

module.exports = ConsoleTransport;
