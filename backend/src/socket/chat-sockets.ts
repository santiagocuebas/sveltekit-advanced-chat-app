import type { ChatSockets } from '../types/sockets.js';
import { Chat } from '../models/index.js';

export const chatSockets: ChatSockets = (socket, [userID, contactID, roomID], username) => {
	socket.on('emitChat', async (message: string, tempID: string) => {
		const chat = await Chat.create({
			from: userID,
			to: contactID,
			username: roomID.length <= 24 ? username : undefined,
			content: message,
			createdAt: new Date
		});

		socket.emit('loadChatID', chat.id, tempID);
		socket.to(roomID).emit('loadChat', chat);
		socket.to(roomID).emit('editContacts', roomID, chat.content, chat.createdAt);
	});

	socket.on('emitDelete', async (id: string) => {
		await Chat.deleteOne({ _id: id, from: userID });

		socket.to(roomID).emit('deleteChat', id);
	});
};
