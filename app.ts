// import { fileURLToPath } from "url";
import { createServer } from "node:http";
import { Server } from "socket.io";
import morgan from 'morgan'

require('dotenv').config();

const path = require('path')
const express = require('express');
const chatrouter = require('./router/chatRouter')
const routes = require('./router/routes')
const authRoutes = require('./router/auth')
const bodyParser= require("body-parser");

const dirname = path.dirname(__filename)

// ...
const app = express();
const server = createServer(app)

app.use(express.static(path.join(dirname, "public")))

// Middleware for Parsing 
app.use(bodyParser.json());

//morgan for logging HTTP requests
app.use(morgan('dev'));

app.use('/api',authRoutes)
app.use('/api', routes)

// Content Routes

app.get('/signin', (req:any, res:any) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req:any, res:any) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
  });

app.get('/chats', (req:any, res:any) => {
    res.sendFile(path.join(__dirname, 'public', 'chats.html'));
  });

app.get('/chat/:id', (req:any, res:any) => {
    res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});


const io = new Server(server, {  
    // cors: {
    //     origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500"]
    // }
})
chatrouter(io)