import type {
	IKeys,
	ISettingsProps,
	IUser,
	Members,
	ResponseData
} from "$lib/types/global";
import axios from "axios";
import { DIR } from "$lib/config";
import { Formats, Inputs } from "$lib/types/enums";

export const changeName = (value: string) => {
	if (value === Inputs.CONFIRM) return 'Confirm Password';
	const firstLetter = value.at(0) as string;
	return value.replace(value.at(0) as string, firstLetter.toUpperCase());
};

export const setType = (name: string) => {
	return (name === Inputs.USERNAME || name === Inputs.EMAIL) ? 'text' : 'password';
};

export const getId = () => {
	const validChar = '0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ';
	let id = '';

	for (let i = 0; i < 16; i++) {
		id += validChar.at(Math.floor(Math.random() * validChar.length));
	}

	return id;
};

export const getDate = (createdAt: string) => {
	const date = new Date(createdAt);
	const newDate = new Date();
	const days = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
	const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
	const result = newDate.getTime() - date.getTime();

	if (result < 1000 * 60 * 60 * 24) {
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return hours + ':' + minutes;
	} else if (result < 1000 * 60 * 60 * 24 * (365.2422 / 12)) {
		return date.getDate() + ' ' + days[date.getDay()];
	}
	
	return months[date.getMonth()] + ' ' + date.getFullYear();
};

export const getImages = async (files: FileList | null) => {
	let filenames: string[] | null = null;

	if (files && files.length < 4) {
		const formData = new FormData();
		const validFormat: string[] = Object.values(Formats);
		let match = true;

		for (const file of files) {
			if (file.size > 1e7 * 2 && !validFormat.includes(file.type)) {
				match = false;
				break;
			}

			formData.append('images', file);
		}

		if (match) {
			const data: ResponseData = await axios({
				method: 'POST',
				url: DIR + '/api/home/images',
				data: formData,
				withCredentials: true
			}).then(res => res.data)
				.catch(err => err.response.data);

			if (data && data.filenames) filenames = data.filenames;
		}
	}

	return filenames;
};

export const sendAvatar = async (file: File, id: string) => {
	const formData = new FormData()
	formData.append('avatar', file);
	formData.append('id', id);

	const data: ResponseData = await axios({
		method: 'POST',
		url: DIR + '/api/home/group',
		data: formData,
		withCredentials: true
	}).then(res => res.data)
		.catch(err => err.response?.data);

	return data.filename;
};

export const initSettingsProps = ({ description }: IUser): ISettingsProps => {
	return {
		avatar: '',
		username: '',
		description,
		password: {
			match: false,
			new: false,
			confirm: false
		},
		unblock: { users: [], groups: [] },
		resetProps: function(this, prop: string) {
			if (typeof this[prop] !== 'string') {
				const props = this[prop] as IKeys<string[]> | IKeys<boolean>;
				
				Object.entries(props).forEach(([key, value]) => {
					props[key] = (value instanceof Array) ? [] : false;
				});

				this[prop] = props;
			} else this[prop] = '';

			return this;
		}
	}
};

export const addId = ({ id }: Members, list: string[]) => {
	return !list.includes(id) ? [id, ...list] : list.filter(item => item !== id);
};

export const getData = ([actPass, newPass, confirmPass]: (() => void)[]) => {
	return [
		{ name: 'actPassword', text: 'Enter the actual password', key: actPass },
		{ name: 'newPassword', text: 'Enter the new password', key: newPass },
		{ name: 'confirmPassword', text: 'Confirm the password', key: confirmPass }
	];
};

export const isDisabled = ({ description }: IUser) => {
	return {
		avatar: (props: ISettingsProps) => props.avatar,
		username: (props: ISettingsProps) => {
			return props.username.length > 3  && props.username.length <= 40;
		},
		description: (props: ISettingsProps) => props.description !== description,
		password: (props: ISettingsProps) => {
			return props.password.match && props.password.new && props.password.confirm;
		},
		unblock: (props: ISettingsProps) => {
			return props.unblock.users.length || props.unblock.groups.length;
		}
	};
};
