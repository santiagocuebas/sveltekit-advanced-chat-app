import type { ActUser } from '../types/types.js';
import { v2 as cloudinary } from 'cloudinary';
import { getChats } from './get-data.js';

export const actUser: ActUser = (contactID, roomID, user, name) => {
	user.users = user.users.filter(user => user.userID !== contactID);
	user.userIDs = user.userIDs.filter(id => id !== contactID);
	user.userRooms = user.userRooms.filter(id => id !== roomID);
	
	if (name !== undefined) {
		user.blockedUsers.push({ id: contactID, name });
		user.blockedUsersIDs.push(contactID);
	}

	return user;
};

export const deleteChats = async (userID: string, contactID: string) => {
	const chats = await getChats(contactID, userID);

	for (const chat of chats) {
		if (chat.content instanceof Array) {
			for (const image of chat.content) {
				const [imageFullURL] = image.split('/').reverse();
				const [imageURL] = imageFullURL.split('.');
				
				await cloudinary.uploader
					.destroy('advanced/public/' + imageURL)
					.catch(() => {
						console.error('An error occurred while trying to delete the image');
					});
			}
		}

		chat.deleteOne();
	}
};
