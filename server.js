const path = require('path')

const dir = path.join(__dirname)

process.env.NODE_ENV = 'production'
process.chdir(__dirname)

const currentPort = parseInt(process.env.PORT, 10) || 3000
const hostname = process.env.HOSTNAME || '0.0.0.0'

// Load the standalone server
// Hostinger will run this file. We point it to the built server.
require('./.next/standalone/server.js');
