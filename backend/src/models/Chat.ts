import { Schema, model } from 'mongoose';
import { IChat } from '../types/global.js';

const chatSchema = new Schema<IChat>({
	from: String,
	to: String,
	username: String,
	content: String,
	createdAt: { type: Date, default: new Date }
});

export const Chat = model<IChat>('Chat', chatSchema);
