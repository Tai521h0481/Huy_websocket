const {Room} = require('../models');

const createRoom = async (req, res) => {
    const { room } = req.body;
    try {
      const newRoom = await Room.create({ roomNumber: room });
      res.status(201).json(newRoom);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const getIdByNumber = async (req, res) => {
    const id = req.query.id || req.params.id || req.body.id;
    try {
      const isExistRoom = await Room.findOne({ roomNumber: id });
      if (isExistRoom) {
        res.status(200).json(isExistRoom);
      } else {
        res.status(404).json({ error: "Room not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

module.exports = {
    createRoom,
    getIdByNumber
};