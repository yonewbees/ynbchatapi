// Connect to WebSocket server
const socket = io('http://localhost:3000', {
    auth: {
        token: "USER_AUTH_TOKEN"
    }
});

// Create a new channel
socket.emit('create_channel', {
    channelName: 'Development Team',
    participants: [1,2] 
}, (response) => {
    if (response.success) {
        console.log('Created channel ID:', response.channel.id);

        // Join the created channel
        socket.emit('join_channel', response.channel.id);

        // Send initial message
        socket.emit('send_message', {
            chatId: response.channel.id,
            messageType: 'text',
            message: 'Welcome to our development channel!',
            attachmentThumbUrl: '',
            attachmentUrl: '',
            title: 'Channel Created'
        });
    } else {
        console.error('Creation failed:', response.message);
    }
});

// Listen for messages
socket.on('receive_message', (message) => {
    console.log('New message:', message);
});

// Handle errors
socket.on('error', (error) => {
    console.error('Socket error:', error);
});
