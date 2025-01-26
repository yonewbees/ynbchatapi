import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a chat
export async function createChat(creatorId: number, title: string, participantIds: number[]) {
  const chat = await prisma.chat.create({
    data: {
      title,
      creatorId,
      Participants: {
        create: participantIds.map((userId) => ({
          userId,
          type:"member"
        })),
      },
    },
    include: { Participants: true },
  });

  return chat;
}

// Delete Chat
export async function deleteChat(chatId: number, userId: number) {
  try {
    // Check if the user is the creator of the chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.creatorId !== userId) {
      throw new Error("Unauthorized");
    }

    // Delete all related messages
    await prisma.message.deleteMany({
      where: { chatId },
    });

    // Delete the chat
    const deletedChat = await prisma.chat.delete({
      where: { id: chatId },
    });

    return deletedChat;
  } catch (error:any) {
    console.error("Error deleting chat:", error.message);
    throw error;
  }
}


// Delete Message
export async function deleteMessage(messageId: number, userId: number) {
  try {
    // Check if the user is the sender of the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("You cannot perform this action");
    }

  // Delete the message
    const deletedMessage = await prisma.message.delete({
      where: { id: messageId },
    });

    return deletedMessage;
  } catch (error:any) {
    console.error("Error:", error.message);
    throw error;
  }
}

// Create a message
export async function createMessage(
  userId: number,
  chatId: number | null, 
  participantIds: number[], 
  messageType: string,
  message: string,
  attachmentThumbUrl: string,
  attachmentUrl: string,
  title: string
) {
  const chat: any = chatId
    ? await prisma.chat.findUnique({
        where: { id: chatId },
      })
    : await createChat(userId, title, participantIds);

  const resp = await prisma.message.create({
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
}


// Fetch user chats
export async function fetchUserChats(userId: number) {
  const chats = await prisma.chat.findMany({
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
}

// Fetch Messages in a chat

export async function fetchMessages(chatId: number, userId: number) {
  // Check if the user is in the chat
  const isParticipant = await prisma.participant.findFirst({
    where: {
      chatId,
      userId,
    },
  });

  if (!isParticipant) {
    throw new Error('User is not a participant in this chat.');
  }

  // Fetch messages in the chat
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
  });

  return messages;
}

// Fetch User Contacts
async function fetchUserContacts(userId: number) {
  const contacts = await prisma.contact.findMany({
    where: {
      userId,
    },
  });

  return contacts;
}

// Block User contact

export async function blockUser(userId: number, participantId: number) {
  const block = await prisma.blockList.create({
    data: {
      userId,
      participantId,
    },
  });

  return block;
}



// Report User Contact
export async function reportParticipant(userId: number, participantId: number, reportType: string, notes: string) {
  const report = await prisma.report.create({
    data: {
      userId,
      participantId,
      reportType,
      notes,
    },
  });

  return report;
}

module.exports = {reportParticipant,deleteChat,deleteMessage,
   createChat,createMessage, 
  fetchUserChats,fetchMessages,blockUser, fetchUserContacts 
}