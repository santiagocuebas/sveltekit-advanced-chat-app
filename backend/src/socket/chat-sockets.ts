import type { ChatSockets } from '../types/sockets.js';
import { ErrorMessage } from '../dictionary.js';
import { deleteFile } from '../libs/index.js';
import { Chat } from '../models/index.js';
import { Folder, TypeContact } from '../types/enums.js';

export const chatSockets: ChatSockets = async (
	socket,
	[userID, contactID, roomID],
	type,
	username
) => {
	socket.on('emitChat', async (message: string | string[], tempID: string) => {
		try {
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
	
			const emitString = (type === TypeContact.GROUP) ? 'editGroup' : 'editUser';
			socket.to(roomID).emit(emitString, chat);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});

	socket.on('emitFindChat', async (chatID: string) => {
		// Create a new chat
		const chat = await Chat
			.findOne({ _id: chatID })
			.catch(() => null);

		if (chat === null) {
			return socket.emit('socketError', ErrorMessage.failureDatabase);
		}

		socket.to(roomID).emit('loadChat', chat, roomID);

		const emitString = (type === TypeContact.GROUP) ? 'editGroup' : 'editUser';
		return socket.to(roomID).emit(emitString, chat);
	});

	socket.on('emitDelete', async (id: string) => {
		// Find and delete a chat
		const chat = await Chat
			.findOneAndDelete({ _id: id, from: userID })
			.catch(() => null);

		if (chat === null) {
			return socket.emit('socketError', ErrorMessage.failureDatabase);
		}

		if (chat.content instanceof Array) {
			for (const file of chat.content) {
				deleteFile(file, Folder.PUBLIC);
			}
		}

		return socket.to(roomID).emit('deleteChat', chat);
	});
};
