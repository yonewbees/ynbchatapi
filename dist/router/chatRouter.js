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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const models = require('../models/models');
const authSocketUSER = require("../middleware/socketAuth");
function startChannel(io) {
    // Authenticate users 
    io.use(authSocketUSER);
    // Connect User
    io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Get user data from the socket
        const user = (_a = socket.user) === null || _a === void 0 ? void 0 : _a.users;
        if (!user) {
            socket.disconnect();
            return;
        }
        // User joins a channel 
        socket.on("join_channel", (channelId) => __awaiter(this, void 0, void 0, function* () {
            // Find this channel
            const channel = yield prisma.chat.findUnique({
                where: { id: channelId },
                include: { Participants: true },
            });
            if (!channel) {
                socket.emit("error", { 'error': "Channel not found" });
                return;
            }
            const isParticipant = channel.Participants.some((p) => p.userId === user.id);
            if (!isParticipant) {
                socket.emit("error", { message: "You are not a participant in this channel" });
                return;
            }
            socket.join(channelId.toString());
            // console.log(`User ${user.email} joined channel ${channelId}`);
            socket.emit("joined_channel", { channelId });
        }));
        // Send a message to a channel
        socket.on("send_message", (data) => __awaiter(this, void 0, void 0, function* () {
            const { chatId, message, attachmentThumbUrl, attachmentUrl, title, messageType } = data;
            const channelId = chatId;
            // Check if the user is part of the channel
            const channel = yield prisma.chat.findUnique({
                where: { id: channelId },
                include: { Participants: true },
            });
            if (!channel) {
                socket.emit("error", { message: "Channel not found" });
                return;
            }
            const isParticipant = channel.Participants.some((p) => p.userId === user.id);
            if (!isParticipant) {
                socket.emit("error", { message: "You are not a participant in this channel" });
                return;
            }
            const participantsIds = channel.Participants.map((i) => {
                if (i.id) {
                    return i.id;
                }
            });
            // Save the message in the database
            const resp = yield models.createMessage(user.id, channelId, participantsIds, messageType, message, attachmentThumbUrl, attachmentUrl, title);
            // Emit the message to everyone in the channel
            io.to(channelId.toString()).emit("receive_message", resp);
        }));
        // Handle user disconnection
        socket.on("disconnect", () => {
        });
    }));
}
exports.default = startChannel;
