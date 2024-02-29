import type { ChatSockets } from '../types/sockets.js';
import fs from 'fs/promises';
import { resolve } from 'path';
import { getChats } from '../libs/get-data.js';
import { Chat } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const chatSockets: ChatSockets = async (socket, [userID, contactID, roomID], type, username) => {
	// Get chats from the contacts
	const param = type === TypeContact.USER ? userID : undefined;

	const messages = await getChats(contactID, param);

	socket.emit('loadChats', messages);

	socket.on('emitChat', async (message: string | string[], tempID: string) => {
		// Create a new chat
		const chat = await Chat.create({
			from: userID,
			to: contactID,
			type,
			username,
			content: message,
			createdAt: new Date
		});

		socket.emit('loadChatID', chat.id, tempID);
		socket.to(roomID).emit('loadChat', chat, roomID);

		const emitString = type === TypeContact.GROUP ? 'editGroup' : 'editUser';
		socket.to(roomID).emit(emitString, roomID, chat);
	});

	socket.on('emitDelete', async (id: string) => {
		// Find and delete a chat
		const chat = await Chat.findOneAndDelete({ _id: id, from: userID });

		if (chat !== null && chat.content instanceof Array) {
			for (const imageUrl of chat.content) {
				// Unlink images if exists
				const path = resolve(imageUrl);
				await fs
					.unlink(path)
					.catch(err => console.error(err));
			}
		}

		socket.to(roomID).emit('deleteChat', id);
	});
};
