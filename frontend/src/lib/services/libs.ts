import type { ISettingsProps, Member, ResponseData } from "$lib/types/global";
import axios from "$lib/axios";
import { DIR } from "$lib/config";
import { avatarURL } from "$lib/dictionary";
import { Formats, Inputs, Method } from "$lib/types/enums";

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
				method: Method.POST,
				url: '/home/images',
				data: formData
			}).then(res => res.data)
				.catch(err => err.response?.data);

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
		method: Method.POST,
		url: '/home/group',
		data: formData
	}).then(res => res.data)
		.catch(err => err.response?.data);

	return data.filename;
};

export const setSettingsProps = (avatar: string, description: string): ISettingsProps => {
	return {
		avatar: DIR + avatarURL.user + avatar,
		username: '',
		description,
		password: {
			match: false,
			new: false,
			confirm: false
		},
		unblock: { users: [], groups: [] }
	}
};

export const addId = ({ id }: Member, list: string[]) => {
	return !list.includes(id) ? [id, ...list] : list.filter(item => item !== id);
};

export const getData = ([actPass, newPass, confirmPass]: (() => void)[]) => {
	return [
		{ name: 'actPassword', text: 'Enter the actual password', key: actPass },
		{ name: 'newPassword', text: 'Enter the new password', key: newPass },
		{ name: 'confirmPassword', text: 'Confirm the password', key: confirmPass }
	];
};

export const isDisabled = (avatar: string, description: string) => {
	return {
		avatar: (props: ISettingsProps) => {
			return props.avatar !== DIR + avatarURL.user + avatar;
		},
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
