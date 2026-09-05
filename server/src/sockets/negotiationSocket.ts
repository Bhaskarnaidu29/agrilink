import { Server, Socket } from 'socket.io';

export function setupSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('⚡ Socket client connected:', socket.id);

    // Join user room for targeted notifications
    socket.on('join_user_room', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User joined room: user_${userId}`);
    });

    // Join negotiation room for offer chat
    socket.on('join_negotiation', (offerId: string) => {
      socket.join(`offer_${offerId}`);
      console.log(`💬 Joined negotiation offer_${offerId}`);
    });

    // Send counter offer signal
    socket.on('send_counter_offer', (data: { offerId: string; receiverId: string; counterData: any }) => {
      io.to(`offer_${data.offerId}`).emit('receive_counter_offer', data.counterData);
      io.to(`user_${data.receiverId}`).emit('notification', {
        title: 'New Counter Offer! 🔄',
        message: `Price updated to ₹${data.counterData.pricePerUnit}/kg.`,
      });
    });

    // Send offer message
    socket.on('send_message', (data: { offerId: string; senderName: string; text: string }) => {
      io.to(`offer_${data.offerId}`).emit('receive_message', {
        senderName: data.senderName,
        text: data.text,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });
}
