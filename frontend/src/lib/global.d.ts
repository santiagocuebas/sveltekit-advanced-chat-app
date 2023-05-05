export interface IMessage {
	_id: string;
	from: string;
	body: string;
	createdAt: Date;
}

export interface ResponseData {
	[index: string]: DataItem | string | boolean;
}

export interface DataItem {
	[index: string]: string | boolean | number;
}
