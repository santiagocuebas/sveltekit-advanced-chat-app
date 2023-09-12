import type { Direction } from '../types/types.js';
import { serialize } from 'cookie';
import fs from 'fs-extra';
import { extname, resolve } from 'path';
import { DOMAIN, NODE_ENV } from '../config.js';
import { encryptPassword, getId } from '../libs/index.js';
import { Chat, Group, User } from '../models/index.js';

export const postAvatar: Direction = async (req, res) => {
	const { id, avatar } = req.user;
	const tempPath = req.file?.path as string;
	const ext = extname(req.file?.originalname as string).toLowerCase();
	const avatarURL = await getId() + ext;
	const oldPath = resolve(`uploads/avatar/${avatar}`);
	const targetPath = resolve(`uploads/avatar/${avatarURL}`);

	// Unlink old avatar
	if (avatar !== 'avatar.png') await fs.unlink(oldPath);

	// Set avatar location
	await fs.rename(tempPath, targetPath);

	// Update database with the new avatar
	await User.updateOne({ _id: id }, { avatar: avatarURL });

	return res.json({
		success: 'success-settings',
		filename: avatarURL,
		message: 'Your avatar has been successfully updated'
	});
};

export const postUsername: Direction = async (req, res) => {
	await User.updateOne({ _id: req.user.id }, { username: req.body.username });

	return res.json({
		success: 'success-settings',
		message: 'Your avatar has been successfully updated'
	});
};

export const postDescription: Direction = async (req, res) => {
	await User.updateOne(
		{ _id: req.user.id },
		{ description: req.body.description }
	);

	return res.json({
		success: 'success-settings',
		message: 'Your avatar has been successfully updated'
	});
};

export const postPassword: Direction = async (req, res) => {
	const password = await encryptPassword(req.body.password);

	await User.updateOne({ _id: req.user.id }, { password });

	return res.json({
		success: 'success-settings',
		message: 'Your avatar has been successfully updated'
	});
};

export const postUnblock: Direction = async (req, res) => {
	await User.updateOne(
		{ _id: req.user.id },
		{ $pull: { blacklist: { id: { $in: req.body.userIDs } } } }
	);

	return res.json({
		success: 'success-settings',
		message: 'Your avatar has been successfully updated'
	});
};

export const deleteUser: Direction = async (req, res) => {
	const { id, userIDs, groupRooms } = req.user;
	
	const user = await User
		.findOneAndDelete({ _id: id })
		.lean({ virtuals: true });

	if (user !== null) {
		if (user.avatar !== 'avatar.png') {
			const path = resolve(`uploads/avatar/${user.avatar}`);
			await fs.unlink(path);
		}

		const chats = await Chat.find({
			$or: [
				{ from: id },
				{ to: id }
			]
		});

		for (const chat of chats) {
			if (chat.content instanceof Array) {
				for (const image of chat.content) {
					const path = resolve(`uploads/${image}`);
					await fs.unlink(path);
				}
			}

			chat.deleteOne();
		}

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

		const groups = await Group.find({ admin: id });

		for (const group of groups) {
			if (group.avatar !== 'avatar.jpeg') {
				const path = resolve(`uploads/group-avatar/${group.avatar}`);
				await fs.unlink(path);
			}

			const groupID = String(group._id);

			const chats = await Chat.find({ to: groupID });
			
			for (const chat of chats) {
				if (chat.content instanceof Array) {
					for (const image of chat.content) {
						const path = resolve(`uploads/${image}`);
						await fs.unlink(path);
					}
				}
	
				chat.deleteOne();
			}

			group.deleteOne();
		}
		
		// Delete cookie authenticate
		res.set('Set-Cookie', serialize('authenticate', '', {
			domain: DOMAIN,
			httpOnly: true,
			maxAge: 0,
			path: '/',
			sameSite: 'lax',
			secure: NODE_ENV === 'production'
		}));

		return res.json({ delete: true });
	}

	return res.json({ delete: false });
};
