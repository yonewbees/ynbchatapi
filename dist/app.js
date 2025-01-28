"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { fileURLToPath } from "url";
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
require('dotenv').config();
const path = require('path');
const express = require('express');
const chatrouter = require('./router/chatRouter');
const routes = require('./router/routes');
const authRoutes = require('./router/auth');
const bodyParser = require("body-parser");
const dirname = path.dirname(__filename);
// ...
const app = express();
const server = (0, node_http_1.createServer)(app);
app.use(express.static(path.join(dirname, "public")));
// Middleware (if using)
app.use(bodyParser.json());
app.use('/api', routes);
app.use('/api', authRoutes);
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.get('/chats', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chats.html'));
});
app.get('/chats/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'room.html'));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
const io = new socket_io_1.Server(server, {
// cors: {
//     origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500"]
// }
});
chatrouter(io);
