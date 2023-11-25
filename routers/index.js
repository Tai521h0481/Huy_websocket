const express = require('express');
const rootRouter = express.Router();
const usersRouter = require('./users.router');
const roomRouter = require('./room.router');
const messageRouter = require('./message.router');
rootRouter.use('/users', usersRouter);
rootRouter.use('/room', roomRouter);
rootRouter.use('/message', messageRouter);
module.exports = rootRouter;