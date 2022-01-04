const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet'),
    server = express();
const { setRoutes } = require('./routes');
const path = require('path'),
    expressValidator = require('express-validator');

// For security

server.use(helmet());

const cors = require('cors'),
    // Allow Origins according to your need.
    corsOptions = {
        'origin': '*'
    };

server.use(cors(corsOptions));

server.use(bodyParser.json());
server.use(expressValidator())
/**
     * Serving Static files from uploads directory.
     * Currently Media module is uploading files into this directory.
     */
server.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Setting up Routes
setRoutes(server);

module.exports = { server };
