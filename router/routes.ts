import express from'express';

const models = require('../models/models')
const routeMiddleware = require('../middleware/routeAuth')


const {createMessage,blockUser,fetchMessages,fetchUserChats,deleteChat, deleteMessage, reportParticipant} = models

const router = express.Router();

router.use(routeMiddleware)

// Get User Chats
router.get('/:uid/chats', async (req:any, res:any) => {
  const userId = parseInt(req.params.uid);
  try {
    const chats = await fetchUserChats(userId); // Using the model function
    res.json(chats);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});

// Create A Message
router.post('/new-message', async (req:any, res:any) => {
  const userId = parseInt(req.params.uid);
  const {chatId,title,participantIds,messageType,message,attachmentThumbUrl,attachmentUrl} = req.body
  try {
    const chat = await createMessage(userId,chatId,participantIds,messageType,message,attachmentThumbUrl,attachmentUrl,title); // Using the model function
    res.json(chat);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Messages in a Chat
router.get('/:chatId/messages', async (req:any, res:any) => {
  const chatId = parseInt(req.params.chatId);
  const userId = parseInt(req.query.userId as string);

  try {
    const messages = await fetchMessages(chatId, userId); // Using the model function
    res.json(messages);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Chat
router.delete('/chat/:chatId', async (req:any, res:any) => {
  const chatId = parseInt(req.params.chatId);
  const userId = parseInt(req.query.userId as string);

  try {
    const deletedChat = await deleteChat(chatId, userId); // Using the model function
    res.json(deletedChat);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Message
router.delete('/message/:messageId', async (req:any, res:any) => {
  const messageId = parseInt(req.params.messageId);
  const userId = parseInt(req.query.userId as string);
  try {
    const deletedMessage = await deleteMessage(messageId,userId)
    res.json(deletedMessage);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});

// Block User
router.post('/block', async (req:any, res:any) => {
  const { userId, participantId } = req.body;
  try {
    const blockedUser = await blockUser(userId, participantId); // Using the model function
    res.json(blockedUser);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});

// Report Chat
router.post('/report', async (req:any, res:any) => {
  const { userId, participantId, reportType, notes } = req.body;
  try {
    const report = await reportParticipant(userId, participantId, reportType, notes); // Using the model function
    res.json(report);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router ; 