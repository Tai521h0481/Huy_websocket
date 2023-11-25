const express = require('express');
const roomRouter = express.Router();
const {Room} = require('../models');
const {checkVariable, isExistRoom} = require('../middlewares/validation');
const {createRoom, getIdByNumber} = require('../controllers/room.controller');
roomRouter.post('/', isExistRoom(Room), createRoom);
roomRouter.get('/roomNumber/:id', getIdByNumber);
module.exports = roomRouter;