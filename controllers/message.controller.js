const {Message} = require('../models');

const getMessageByIdRoom = async (req, res) => {
  const idRoom = req.params.id || req.body.id || req.query.id;
  try {
      // Use Mongoose to find messages and populate user details
      const messages = await Message.find({ roomId: idRoom })
          .populate('userId', 'id avatar name') // Populate user details
          .sort('createdAt') // Sort by createdAt
          .exec();

      res.status(200).json(messages);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

  
const saveMessage = async (req, res) => {
  const { message, userId, roomId, isLinkLocation, date } = req.body;
  try {
      // Create a new message document
      const newMessage = await Message.create({
          message, 
          userId, 
          roomId, 
          isLinkLocation, 
          createdAt: date // Assuming you want to use the date from the request
      });

      res.status(201).json(newMessage);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

module.exports = {
    saveMessage,
    getMessageByIdRoom
}