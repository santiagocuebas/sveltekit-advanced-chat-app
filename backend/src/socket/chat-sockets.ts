import type { ChatSockets } from '../types/sockets.js';
import fs from 'fs-extra';
import { resolve } from 'path';
import { Chat } from '../models/index.js';

export const chatSockets: ChatSockets = (socket, [userID, contactID, roomID], username) => {
	socket.on('emitChat', async (message: string | string[], tempID: string) => {
		const chat = await Chat.create({
			from: userID,
			to: contactID,
			username: username ? username : undefined,
			content: message,
			createdAt: new Date
		});

		socket.emit('loadChatID', chat.id, tempID);
		socket.to(roomID).emit('loadChat', chat);

		username
			? socket.to(roomID).emit('editGroup', roomID, chat)
			: socket.to(roomID).emit('editUser', roomID, chat);
	});

	socket.on('emitDelete', async (id: string) => {
		const chat = await Chat.findOneAndDelete({ _id: id, from: userID });

		if (chat !== null && chat.content instanceof Array) {
			for (const url of chat.content) {
				const path = resolve(`uploads/${url}`);
				const err = await fs
					.unlink(path)
					.catch(err => err);
				
				if (err) console.log(err);
			}
		}

		socket.to(roomID).emit('deleteChat', id);
	});
};
