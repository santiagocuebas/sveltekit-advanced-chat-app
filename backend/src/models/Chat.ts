import { Schema, model } from 'mongoose';
import { IChat } from '../global.js';

const chatSchema = new Schema<IChat>({
	from: String,
	body: String,
	createdAt: { type: Date, default: new Date }
});

export const Chat = model<IChat>('Chat', chatSchema);
