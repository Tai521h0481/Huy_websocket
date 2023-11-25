const { User } = require("../models");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const SECRET_key = "tainguyen";
const expiresIn = '10h';

const register = async (req, res) => {
    let { id, name, email, password, avatar } = req.body;
    const hashPassword = bcrypt.hashSync(password, 10);
  
    try {
      let user = null;
      if (!avatar || !id) {
        avatar = gravatar.url(email, { s: '100', r: 'x', d: 'retro' }, true);
        user = await User.create({
          name,
          email,
          password: hashPassword,
          avatar,
          follower: Math.floor(Math.random() * 1000),
          liked: Math.floor(Math.random() * 1000),
          disliked: Math.floor(Math.random() * 1000),
        });
      } else {
        user = await User.create({
          id,
          name,
          email,
          password: hashPassword,
          avatar,
          follower: Math.floor(Math.random() * 1000),
          liked: Math.floor(Math.random() * 1000),
          disliked: Math.floor(Math.random() * 1000),
        });
      }
      res.status(201).json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ data: user }, SECRET_key, { expiresIn });
        res.cookie('token', token, { maxAge: 3600000 });
        res.status(200).json({ token });
      } else {
        res.status(401).json({ error: "Invalid login" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const updateUser = async (req, res) => {
    const { name, avatar, roomId } = req.body;
    const { id } = req.params;
    try {
      await User.findByIdAndUpdate(id, { name, avatar, roomId });
      res.status(200).json({ message: "Update user successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const getUserById = async (req, res) => {
    const id = req.params.id || req.body.id || req.query.id;
    try {
      const user = await User.findById(id);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const upLoadAvatar = async (req, res) => {
    const { file } = req;
    const urlImg = `http://localhost:3000/${file.path}`;
    const id = req.params.id || req.body.id || req.query.id;
    try {
      const user = await User.findByIdAndUpdate(id, { avatar: urlImg }, { new: true });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const logout_removeCookie = (req, res) => {
    try {
      res.clearCookie('token');
      res.status(200).json({ message: "Logout successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const getAllUsers = async (req, res) => {
    const id = req.params.id || req.body.id || req.query.id;
    try {
      const users = await User.find({ roomId: id });
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const getUserByRoom = async (id) => {
    try {
      const users = await User.aggregate([
        {
          $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'roomInfo',
          },
        },
        {
          $match: {
            'roomInfo.roomNumber': id,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            avatar: 1,
          },
        },
      ]);
      return users;
    } catch (error) {
      console.log(error);
    }
  };
  
  const outRoom = async (id) => {
    try {
      await User.findByIdAndUpdate(id, { roomId: null });
    } catch (error) {
      console.log(error);
    }
  };
  
  const updateLikeDislikeFollow = async (req, res) => {
    const id = req.params.id || req.body.id || req.query.id;
    const { liked, disliked, follower } = req.body;
    try {
      await User.findByIdAndUpdate(id, { liked, disliked, follower });
      res.status(200).json({ message: "Update successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

module.exports = {
    register,
    login,
    SECRET_key,
    updateUser,
    getUserById,
    upLoadAvatar,
    logout_removeCookie,
    getAllUsers,
    getUserByRoom,
    outRoom,
    updateLikeDislikeFollow
};