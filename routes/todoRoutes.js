const express = require('express');
const fs = require('fs/promises');
const uuid = require('uuid');

const todoRouter = express.Router();

async function readData(path) {
    return fs.readFile(path, 'utf-8');    
}

async function writeData(data) {
    return fs.writeFile('./data.json', JSON.stringify(data, null, 4));
}

todoRouter
    .get('/', (req, res) => {
        readData('./data.json')
            .then(data => {
                res.status(200).json({ success: true, data: JSON.parse(data) })
            })
            .catch(err => {
                res.status(400).json({ success: false, error: err })
            })
    })
    .post('/', (req, res) => {
        const { body } = req;

        if(!body.title || !body.reminder) {
            return res.status(400).json({ success: false, message: "Provide Required Data" })
        }

        readData('./data.json')
            .then(data => {
                data = JSON.parse(data);

                body.id = uuid.v4();
                body.completed = false;
                body.isReminded = false;

                data.push(body);

                return writeData(data);
            })
            .then(() => {
                res.status(201).json({ success: true, data: body })
            })
            .catch(err => {
                res.status(400).json({ success: false, error: err })
            })
    })
    .put('/:id', (req, res) => {
        const { id } = req.params;
        const { body } = req;

        readData('./data.json')
            .then(data => {
                data = JSON.parse(data);

                const updatedTodo = data.find(todo => todo.id === id)
                
                Object.keys(body).forEach(key => {
                    updatedTodo[key] = body[key];
                })

                return writeData(data)
            })
            .then(() => {
                res.status(201).json({ success: true, message: 'Todo Updated Successfully' })
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({ succes: false, error: err })
            })
    })
    .delete('/:id', (req, res) => {
        const { id } = req.params;

        readData('./data.json')
            .then(data => {
                data = JSON.parse(data);

                data = data.filter(todo => {
                    if(todo.id == id) return false
                    return true;
                });

                return writeData(data);
            })
            .then(() => {
                res.status(202).json({ success: true, message: "Todo Deleted Successfully" })
            })
            .catch(err => {
                res.status(400).json({ success: false, error: err })
            })
    })

module.exports = {todoRouter, readData, writeData};