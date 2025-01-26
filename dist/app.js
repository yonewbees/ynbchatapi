"use strict";
// import { fileURLToPath } from "url";
require('dotenv').config();
const path = require('path');
const express = require('express');
const chatrouter = require('./router/chatRouter');
const routes = require('./router/routes');
const socket = require('socket.io');
const bodyParser = require("body-parser");
const dirname = path.dirname(__filename);
// ...
const app = express();
app.use(express.static(path.join(dirname, "public")));
// Middleware (if using)
app.use(bodyParser.json());
app.use('', routes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
const io = new socket.Server(app, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500"]
    }
});
chatrouter(io);
