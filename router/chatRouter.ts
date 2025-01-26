import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const models = require('../models/models')
const  authSocketUSER = require("../middleware/socketAuth")


function startChannel(io: any) { 
  // Authenticate users 
  io.use(authSocketUSER); 

  // Connect User
  io.on("connection", async (socket: any) => {

    // Get user data from the socket
    const user = socket.user?.users;

    if (!user) {
      socket.disconnect();
      return;
    }

    // User joins a channel 
    socket.on("join_channel", async (channelId: number) => {
      
      // Find this channel
      const channel = await prisma.chat.findUnique({
        where: { id: channelId },
        include: { Participants: true },
      });

      if (!channel) {
        socket.emit("error", { 'error': "Channel not found" });
        return;
      }

      const isParticipant = channel.Participants.some((p: any) => p.userId === user.id);

      if (!isParticipant) {
        socket.emit("error", { message: "You are not a participant in this channel" });
        return;
      }

      socket.join(channelId.toString());
      // console.log(`User ${user.email} joined channel ${channelId}`);
      socket.emit("joined_channel", { channelId });
    });

    // Send a message to a channel
    socket.on("send_message", async (data: {  
      chatId:number,
      messageType: string,
      message: string,
      attachmentThumbUrl: string,
      attachmentUrl: string,
      title: string}) => {

      const { chatId,message,attachmentThumbUrl,attachmentUrl,title,messageType} = data;
      const channelId = chatId

      // Check if the user is part of the channel
      const channel = await prisma.chat.findUnique({
        where: { id: channelId },
        include: { Participants: true },
      });

      if (!channel) {
        socket.emit("error", { message: "Channel not found" });
        return;
      }

      const isParticipant = channel.Participants.some((p: any) => p.userId === user.id);

      if (!isParticipant) {
        socket.emit("error", { message: "You are not a participant in this channel" });
        return;
      }

      const participantsIds = channel.Participants.map((i:any)=>{
        if (i.id){
            return i.id
        }
      })

      // Save the message in the database
      const resp =  await models.createMessage(
        user.id, 
       channelId, 
        participantsIds, 
        messageType,
        message,
        attachmentThumbUrl,
        attachmentUrl,
        title
      )
      
      // Emit the message to everyone in the channel
      io.to(channelId.toString()).emit("receive_message", resp);

    });

    // Handle user disconnection
    socket.on("disconnect", () => {
    });
  });
}

module.exports =  startChannel;
