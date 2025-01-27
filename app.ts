// import { fileURLToPath } from "url";
import { createServer } from "node:http";
import { Server } from "socket.io";

require('dotenv').config();

const path = require('path')
const express = require('express');
const chatrouter = require('./router/chatRouter')
const routes = require('./router/routes')
const bodyParser= require("body-parser");

const dirname = path.dirname(__filename)

// ...
const app = express();
const server = createServer(app)

app.use(express.static(path.join(dirname, "public")))

// Middleware (if using)
app.use(bodyParser.json());
app.use('/api/', routes)

app.get('/chat', (req:any, res:any) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
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