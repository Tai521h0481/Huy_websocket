const express = require('express');
const messageRouter = express.Router();
const {saveMessage, getMessageByIdRoom} = require('../controllers/message.controller');
messageRouter.post('/', saveMessage);
messageRouter.get('/roomNumber/:id', getMessageByIdRoom);
module.exports = messageRouter;