import type { ChatSockets } from '../types/sockets.js';
import fs from 'fs-extra';
import { resolve } from 'path';
import { Chat } from '../models/index.js';
import { getChats } from '../libs/get-data.js';

export const chatSockets: ChatSockets = async (socket, [userID, contactID, roomID], type, username) => {
	// Get chats from the contacts
	const messages = await getChats(userID, contactID, type);

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
		socket.to(roomID).emit('loadChat', chat, contactID);

		const emitString = username ? 'editGroup' : 'editUser';
		socket.to(roomID).emit(emitString, roomID, chat);
	});

	socket.on('emitDelete', async (id: string) => {
		// Find and delete a chat
		const chat = await Chat.findOneAndDelete({ _id: id, from: userID });

		if (chat !== null && chat.content instanceof Array) {
			for (const url of chat.content) {
				// Unlink images if exists
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
