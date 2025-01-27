"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const models = require('../models/models');
const routeMiddleware = require('../middleware/routeAuth');
const { createMessage, blockUser, fetchMessages, fetchUserChats, deleteChat, deleteMessage, reportParticipant } = models;
const router = express_1.default.Router();
router.use(routeMiddleware);
// Get User Chats
router.get('/:uid/chats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.uid);
    try {
        const chats = yield fetchUserChats(userId);
        res.json(chats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Create A Message
router.post('/new-message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.uid);
    const { chatId, title, participantIds, messageType, message, attachmentThumbUrl, attachmentUrl } = req.body;
    try {
        const chat = yield createMessage(userId, chatId, participantIds, messageType, message, attachmentThumbUrl, attachmentUrl, title); // Using the model function
        res.json(chat);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Get Messages in a Chat
router.get('/:chatId/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = parseInt(req.params.chatId);
    const userId = parseInt(req.query.userId);
    try {
        const messages = yield fetchMessages(chatId, userId);
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Delete Chat
router.delete('/chat/:chatId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = parseInt(req.params.chatId);
    const userId = parseInt(req.query.userId);
    try {
        const deletedChat = yield deleteChat(chatId, userId);
        res.json(deletedChat);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Delete Message
router.delete('/message/:messageId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messageId = parseInt(req.params.messageId);
    const userId = parseInt(req.query.userId);
    try {
        const deletedMessage = yield deleteMessage(messageId, userId);
        res.json(deletedMessage);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Block User
router.post('/block', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, participantId } = req.body;
    try {
        const blockedUser = yield blockUser(userId, participantId);
        res.json(blockedUser);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Report Chat
router.post('/report', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, participantId, reportType, notes } = req.body;
    try {
        const report = yield reportParticipant(userId, participantId, reportType, notes);
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
module.exports = router;
