import type { ChatSockets } from '../types/sockets.js';
import { v2 as cloudinary } from 'cloudinary';
import { Chat } from '../models/index.js';
import { getChats } from '../libs/get-data.js';

const validImageExt = ['apng', 'avif', 'gif', 'jpg', 'png', 'svg', 'webp'];

export const chatSockets: ChatSockets = async (socket, [userID, contactID, roomID], type, username) => {
	// Get chats from the contacts
	const param = username === undefined ? userID : undefined;

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

		const emitString = username ? 'editGroup' : 'editUser';
		socket.to(roomID).emit(emitString, roomID, chat);
	});

	socket.on('emitDelete', async (id: string) => {
		// Find and delete a chat
		const chat = await Chat.findOneAndDelete({ _id: id, from: userID });

		if (chat !== null && chat.content instanceof Array) {
			for (const file of chat.content) {
				// Unlink images if exists
				const [fileFullURL] = file.split('/').reverse();
				const [fileURL, fileExt] = fileFullURL.split('.');
				const resource_type = validImageExt.includes(fileExt) ? 'image' : 'video';
				
				await cloudinary.uploader
					.destroy('advanced/public/' + fileURL, { resource_type })
					.catch(() => {
						console.error('An error occurred while trying to delete the image');
					});
			}
		}

		socket.to(roomID).emit('deleteChat', id);
	});
};
