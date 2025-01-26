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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChat = createChat;
exports.deleteChat = deleteChat;
exports.deleteMessage = deleteMessage;
exports.createMessage = createMessage;
exports.fetchUserChats = fetchUserChats;
exports.fetchMessages = fetchMessages;
exports.blockUser = blockUser;
exports.reportParticipant = reportParticipant;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a chat
function createChat(creatorId, title, participantIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const chat = yield prisma.chat.create({
            data: {
                title,
                creatorId,
                Participants: {
                    create: participantIds.map((userId) => ({
                        userId,
                        type: "member"
                    })),
                },
            },
            include: { Participants: true },
        });
        return chat;
    });
}
// Delete Chat
function deleteChat(chatId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the user is the creator of the chat
            const chat = yield prisma.chat.findUnique({
                where: { id: chatId },
            });
            if (!chat) {
                throw new Error("Chat not found");
            }
            if (chat.creatorId !== userId) {
                throw new Error("Unauthorized");
            }
            // Delete all related messages
            yield prisma.message.deleteMany({
                where: { chatId },
            });
            // Delete the chat
            const deletedChat = yield prisma.chat.delete({
                where: { id: chatId },
            });
            return deletedChat;
        }
        catch (error) {
            console.error("Error deleting chat:", error.message);
            throw error;
        }
    });
}
// Delete Message
function deleteMessage(messageId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the user is the sender of the message
            const message = yield prisma.message.findUnique({
                where: { id: messageId },
            });
            if (!message) {
                throw new Error("Message not found");
            }
            if (message.senderId !== userId) {
                throw new Error("You cannot perform this action");
            }
            // Delete the message
            const deletedMessage = yield prisma.message.delete({
                where: { id: messageId },
            });
            return deletedMessage;
        }
        catch (error) {
            console.error("Error:", error.message);
            throw error;
        }
    });
}
// Create a message
function createMessage(userId, chatId, participantIds, messageType, message, attachmentThumbUrl, attachmentUrl, title) {
    return __awaiter(this, void 0, void 0, function* () {
        const chat = chatId
            ? yield prisma.chat.findUnique({
                where: { id: chatId },
            })
            : yield createChat(userId, title, participantIds);
        const resp = yield prisma.message.create({
            data: {
                senderId: chat.userId,
                chatId: chat.id,
                message,
                messageType,
                attachmentUrl,
                attachmentThumbUrl,
                guid: crypto.randomUUID(),
            },
        });
        return resp;
    });
}
// Fetch user chats
function fetchUserChats(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const chats = yield prisma.chat.findMany({
            where: {
                Participants: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                Participants: true,
                Messages: {
                    take: 1, // Fetch the most recent message
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        return chats;
    });
}
// Fetch Messages in a chat
function fetchMessages(chatId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if the user is in the chat
        const isParticipant = yield prisma.participant.findFirst({
            where: {
                chatId,
                userId,
            },
        });
        if (!isParticipant) {
            throw new Error('User is not a participant in this chat.');
        }
        // Fetch messages in the chat
        const messages = yield prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
        });
        return messages;
    });
}
// Fetch User Contacts
function fetchUserContacts(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const contacts = yield prisma.contact.findMany({
            where: {
                userId,
            },
        });
        return contacts;
    });
}
// Block User contact
function blockUser(userId, participantId) {
    return __awaiter(this, void 0, void 0, function* () {
        const block = yield prisma.blockList.create({
            data: {
                userId,
                participantId,
            },
        });
        return block;
    });
}
// Report User Contact
function reportParticipant(userId, participantId, reportType, notes) {
    return __awaiter(this, void 0, void 0, function* () {
        const report = yield prisma.report.create({
            data: {
                userId,
                participantId,
                reportType,
                notes,
            },
        });
        return report;
    });
}
module.exports = { reportParticipant, deleteChat, deleteMessage,
    createChat, createMessage,
    fetchUserChats, fetchMessages, blockUser, fetchUserContacts
};
