const {Message} = require('../models');

const getMessageByIdRoom = async (req, res) => {
    const idRoom = req.params.id || req.body.id || req.query.id;
    try {
      const messages = await Message.find({ roomId: idRoom }).populate('userId', 'avatar name').sort({ createdAt: 1 });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const saveMessage = async (req, res) => {
    const { message, userId, roomId, isLinkLocation, date } = req.body;
    try {
      const newMessage = await Message.create({ message, userId, roomId, isLinkLocation, time: date });
      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

module.exports = {
    saveMessage,
    getMessageByIdRoom
}