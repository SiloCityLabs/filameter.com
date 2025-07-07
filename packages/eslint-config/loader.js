'use strict';

// Require the output from your TypeScript compilation
// and access the .default property.
const config = require('./dist/index.js').default;

module.exports = config;
