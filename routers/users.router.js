const express = require('express');
const usersRouter = express.Router();
const {register, login, updateUser, getUserById, upLoadAvatar, logout_removeCookie, getAllUsers, getUserByRoom, outRoom, updateLikeDislikeFollow} = require('../controllers/users.controller');
const {validateInput,
    isCreated,
    checkId} = require('../middlewares/validation');
const {User} = require('../models');
const cookieParser = require('cookie-parser');
const {uploadImg} = require('../upload/upload-img');

usersRouter.use(cookieParser());

usersRouter.get('/logout', logout_removeCookie);
usersRouter.post('/register', validateInput(["name", "email", "password"]), isCreated(User), register);
usersRouter.post('/login', validateInput(["email", "password"]), login);
usersRouter.put('/:id', checkId(User), updateUser);
usersRouter.get("/:id", getUserById);
usersRouter.get("/getAll/:id", getAllUsers);
usersRouter.post('/upload-avatar/:id', uploadImg("avatar"), upLoadAvatar);
usersRouter.put('/updateReaction/:id', updateLikeDislikeFollow);

module.exports = usersRouter;