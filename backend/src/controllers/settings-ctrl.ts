import type { Direction } from '../types/types.js';
import { v2 as cloudinary } from 'cloudinary';
import { dataUri, encryptPassword, getId } from '../libs/index.js';
import { Chat, Group, User } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const postAvatar: Direction = async (req, res) => {
	const { id, avatar } = req.user;
	
	if (req.file) {
		const file = dataUri(req.file);

		if (file) {
			const data = await cloudinary.uploader
				.upload(file, {
					public_id: await getId(TypeContact.USER),
					folder: 'advanced/avatar/'
				})
				.catch(() => {
					console.log('An error occurred while trying to uploaded the image');
					return null;
				});

			if (data) {
				// Unlink old avatar
				if (!avatar.includes('avatar.png')) {
					const [avatarFullFilename] = avatar.split('/').reverse();
					const [avatarFilename] = avatarFullFilename.split('.');
					
					await cloudinary.uploader
						.destroy('advanced/group-avatar/' + avatarFilename)
						.catch(() => {
							console.error('An error occurred while trying to delete the image');
						});
				}

				// Update database with the new avatar
				await User.updateOne({ _id: id }, { avatar: data.secure_url });

				return res.json({
					success: true,
					filename: data.secure_url,
					message: 'Your avatar has been successfully updated'
				});
			}
		}
	}

	return res.json({
		message: { log: 'Your avatar has been successfully updated' }
	});
};

export const postUsername: Direction = async (req, res) => {
	// Change username
	await User.updateOne({ _id: req.user.id }, { username: req.body.username });

	return res.json({
		success: true,
		message: 'Your username has been successfully updated'
	});
};

export const postDescription: Direction = async (req, res) => {
	// Change description
	await User.updateOne(
		{ _id: req.user.id },
		{ description: req.body.description }
	);

	return res.json({
		success: true,
		message: 'Your description has been successfully updated'
	});
};

export const postPassword: Direction = async (req, res) => {
	const password = await encryptPassword(req.body.newPassword)
		.catch(err => {
			console.error(err?.message);
			return null;
		});

	// Change password
	if (password) await User.updateOne({ _id: req.user.id }, { password });

	return res.json({
		success: true,
		message: 'Your password has been successfully updated'
	});
};

export const postUnblock: Direction = async (req, res) => {
	// Unblock contacts
	await User.updateOne(
		{ _id: req.user.id },
		{
			$pull: {
				blockedUsers: { id: { $in: req.body.unblockUsers } },
				blockedGroups: { id: { $in: req.body.unblockGroups } }
			}
		}
	);

	return res.json({
		success: true,
		message: 'Your contacts has been successfully updated'
	});
};

export const deleteUser: Direction = async (req, res) => {
	const { id, userIDs, groupRooms } = req.user;
	
	// Delete user
	const user = await User
		.findOneAndDelete({ _id: id })
		.lean({ virtuals: true });

	if (user !== null) {
		// Unlink avatar
		if (!user.avatar.includes('avatar.png')) {
			const [avatarFullFilename] = user.avatar.split('/').reverse();
			const [avatarFilename] = avatarFullFilename.split('.');
			
			await cloudinary.uploader
				.destroy('advanced/avatar/' + avatarFilename)
				.catch(() => {
					console.error('An error occurred while trying to delete the image');
				});
		}

		// Find and delete chats
		const chats = await Chat.find({
			$or: [
				{ from: id },
				{ to: id }
			]
		});

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

		// Delete user id from the contacts
		for (const userID of userIDs) {
			await User.updateOne(
				{ _id: userID },
				{ $pull: { users: { userID: id } } }
			);
		}

		for (const groupID of groupRooms) {
			await Group.updateOne(
				{ _id: groupID },
				{
					$pull: {
						connectedUsers: { $in: userIDs },
						members: { id: { $in: userIDs } },
						mods: { id: { $in: userIDs } }
					}
				}
			);
		}

		// Find and delete groups where the user is the admin
		const groups = await Group.find({ admin: id });

		for (const group of groups) {
			// Unlink avatar
			if (!group.avatar.includes('avatar.jpeg')) {
				const [avatarFullFilename] = group.avatar.split('/').reverse();
				const [avatarFilename] = avatarFullFilename.split('.');
				
				await cloudinary.uploader
					.destroy('advanced/group-avatar/' + avatarFilename)
					.catch(() => {
						console.error('An error occurred while trying to delete the image');
					});
			}

			const groupID = String(group._id);

			// Delete chats of the groups
			const chats = await Chat.find({ to: groupID });
			
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

			group.deleteOne();
		}

		return res.json({ delete: true });
	}

	return res.json({ delete: false });
};
