/**
 * Detects any calls to console.log in the provided file list and lets you know
 */

var esprima = require('esprima');
var walk = require('esprima-walk');
var glob = require('glob');
var fs = require('fs');
var Promise = require('bluebird');
var readFile = Promise.promisify(require('fs').readFile);
var globAsync = Promise.promisify(glob);

/**
 * The names of properties to find on the console object
 *
 * @type {String[]}
 */
exports.names = ['assert', 'count', 'debug', 'dir', 'error', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'trace', 'warn'];

/**
 * The function to output messages with in the case of logAll. Default is console.warn
 *
 * @type {Function}
 */
exports.log = console.warn;

/**
 * Logs all found instances of console.log and calls the callback specifying if there were any instances, or an error
 * if one occurred
 *
 * @param {String} files A file glob
 * @param {Function?} cb Called with arguments <Error, Array>. If there was an error it will not be called again,
 *                       otherwise it will be called at the end with null as the error value and the array of nodes
 *                       found.
 */

function logAll(files, cb) {
    _walkAll(files, function(err, node) {
        if (err) {
            exports.log(err.name + ': ' + err.message + ' in ' + err.file + ':' + err.line + ':' + err.column);
            if (cb) cb(err);
        }

        exports.log('Found console.' + node.type + ' at ' + node.file + ':' + node.line + ':' + node.column + ' with '
                    + node.arguments.length + ' arg(s)');
    }).then(function(allNodes) {
        if (cb) cb(null, allNodes);
    });
}

exports.logAll = logAll;

/**
 * Gets a list of all found console.logs
 *
 * @param {String} files A file glob
 * @param {Function?} cb Called with arguments <Error, Array>. If an error occurred the error will be passed with an
 *                       empty array, otherwise error will be null and an array will be passed.
 */
function getAll(files, cb) {
    walkAll(files)
        .then(function(allNodes) {
            if (cb) cb(null, allNodes);
        })
        .catch(function(err) {
            if (cb) cb(err, []);
        });
}

exports.getAll = getAll;

/**
 * Like walkAll except also returns a promise for internal purposes
 *
 * @see walkAll
 * @param {String} files
 * @param {Function?} cb
 * @returns {Promise}
 * @private
 */
function _walkAll(files, cb) {
    var allNodes = [];

    cb = cb || function() {};

    return globAsync(files).each(function(file) {
        return readFile(file, {encoding: 'utf8'}).then(function(code) {
            try {
                var ast = esprima.parse(code, {loc: true});
                walk(ast, function (node) {
                    // Look for a function call with callee 'console.log'
                    if (node.type === 'ExpressionStatement' &&
                        node.expression &&
                        node.expression.type === 'CallExpression' &&
                        node.expression.callee &&
                        node.expression.callee.object &&
                        node.expression.callee.object.type === 'Identifier' &&
                        node.expression.callee.object.name &&
                        node.expression.callee.object.name.toLowerCase() === 'console' &&
                        node.expression.callee.property &&
                        node.expression.callee.property.type === 'Identifier' &&
                        node.expression.callee.property.name &&
                        exports.names.indexOf(node.expression.callee.property.name) !== -1) {
                            var obj = {
                                type: node.expression.callee.property.name,
                                file: file,
                                line: node.expression.callee.loc.start.line,
                                column: node.expression.callee.loc.start.column,
                                arguments: node.expression.arguments
                            };
                            allNodes.push(obj);

                            cb(null, obj);
                    }
                });
            } catch (ex) {
                ex.file = file;
            }
        });
    })
    .then(function() { return allNodes })
    .catch(function(err) {
        cb(err, {});
    });
}

/**
 * Look through all nodes in all of the matching files and fire the callback for every console.log found
 *
 * @param {String} files A file glob
 * @param {Function?} cb Arguments are <err, obj>. If an error occurs during walking, the function will be called
 *                       with the error and no more after that. Otherwise an object containing the following
 *                       properties will be passed into 'obj':
 *                           {
 *                               type: The logging function used (i.e 'log', 'warn', etc)
 *                               file: The name of the file
 *                               line: The line number on which the console.log was found
 *                               column: The start column for the console.log
 *                               arguments: the arguments to the console.log in AST format
 *                           }
 */
function walkAll(files, cb) {
    _walkAll(files, cb);
}

exports.walkAll = walkAll;