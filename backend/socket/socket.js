const setupSocket = (io) => {
  // Map of userId -> socketId
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Register user
    socket.on('register', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`👤 User registered: ${userId}`);
    });

    // Join a consultation room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`📬 Socket ${socket.id} joined room ${roomId}`);
    });

    // Send message in consultation room
    socket.on('send_message', ({ roomId, message, senderId, senderName, timestamp }) => {
      io.to(roomId).emit('receive_message', {
        message,
        senderId,
        senderName,
        timestamp: timestamp || new Date().toISOString(),
      });
    });

    // Typing indicator
    socket.on('typing', ({ roomId, senderName }) => {
      socket.to(roomId).emit('user_typing', { senderName });
    });

    socket.on('stop_typing', ({ roomId }) => {
      socket.to(roomId).emit('user_stop_typing');
    });

    // --- WebRTC Signaling Events ---

    // 1. Initiate a call
    socket.on('call_user', ({ roomId, signalData, callerName, callerId }) => {
      // Send to others in the room
      socket.to(roomId).emit('incoming_call', { signalData, callerName, callerId });
    });

    // 2. Answer a call
    socket.on('answer_call', ({ roomId, signalData }) => {
      socket.to(roomId).emit('call_accepted', { signalData });
    });

    // 3. Reject a call
    socket.on('reject_call', ({ roomId }) => {
      socket.to(roomId).emit('call_rejected');
    });

    // 4. Send ICE candidate
    socket.on('ice_candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice_candidate', { candidate });
    });

    // 5. End call
    socket.on('end_call', ({ roomId }) => {
      socket.to(roomId).emit('call_ended');
    });

    socket.on('disconnect', () => {
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) onlineUsers.delete(userId);
      });
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
