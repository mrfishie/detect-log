var detect = require('./');

var glob = '**/*.js';
if (process.argv.length > 2) glob = process.argv[2];
if (process.argv.length > 3) detect.names = process.argv[3].split(',');

detect.logAll(glob, function(err, nodes) {
    // If there was a parse error or there were multiple nodes, we want whatever is using this file to
    // know (i.e a continuous integration system), so exit with code 1
    if (err || nodes.length) process.exit(1);
    else detect.log("Loggin' is lookin' OK from here!");
});