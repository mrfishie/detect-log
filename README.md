# detect-log

Looks through a list of files and tells you if there are calls to any console functions through static analysis.

This means that only direct *calls* (not assignments) to console.log or similar will be found (i.e creating a variable with console.log as the value and then calling it doesn't count).

	npm install detect-log -g
	detect *.js

## Installation

Install with NPM. To use the command, install it globally:

	npm install detect-log -g

To use in your projects, install it locally

	npm install detect-log --save

## Command-line usage

	detect [glob[, properties]]

**glob** is a glob pattern for finding files. The default is `**/*.js` (all Javascript files in this directory or subdirectories).

**properties** is a comma-separated list of properties to look for on the console object. The default is the value of detect.names (see below).

If any calls are found or an error occurs, the process will exit with code 1 to inform automatic systems (like continuous integration) that something went wrong.

## API usage

```js
var detect = require('detect-log');
```

### String[] detect.names
A list of all names to search for on the console object. Default is

```js
['assert', 'count', 'debug', 'dir', 'error', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
	'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'trace', 'warn']
```

### Function detect.log
The function to use to output messages with detect.logAll. Default is console.warn.

### detect.logAll(String files[, Function cb<Error|null, Array>])

Logs any errors or console calls found. When it is finished or if it encounters an error, calls the callback. The error is supplied as the first argument. If no error occurred, the list of all found logs will be in the second argument, as per detect.walkAll.

### detect.getAll(String files[, Function cb<Error|null, Array>])

Like detect.logAll but without the logging.

### detect.walkAll(String files[, Function cb<Error|null, Object>])

Looks through each file finding any logs, and calls the function when one is found. If an error occurs execution is stopped and the error is passed to the first argument, with an added `file` property containing the file that the error occurred in. Otherwise, an object will be passed to the second argument containing the following properties:

 - **type** - The type of logging function (e.g. 'log', 'warn', etc)
 - **file** - The file that the call was in
 - **line** - The line in the file that the call was on
 - **column** - The column indicating the start of the call to the logging function
 - **arguments** - An array containing the arguments AST for the call

## License

The MIT License (MIT)

Copyright (c) 2015 Tom Barham

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
