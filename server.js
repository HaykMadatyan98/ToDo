const express = require('express');
const cors = require('cors');
const {todoRouter, readData, writeData} = require('./routes/todoRoutes.js');

const { WebSocketServer } = require("ws");

const server = new WebSocketServer({ port: 3000 });

server.on("connection", (socket) => {
  setInterval( async () => {
    let data = await readData('./data.json');
    data = JSON.parse(data)
    data.forEach(todo => {
        if (!todo.isReminded && new Date(todo.reminder) - new Date() < 120000) {
            todo.isReminded = 'true';
            socket.send(todo.title)
            writeData(data)
        }
    })
  }, 5000)
})

const app = express();

app.use(cors());
app.use(express.json());

app.use('/todo', todoRouter);

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, error: err })
})

app.listen(5000, () => {
  console.log(`Server is listening on port 5000`);
})