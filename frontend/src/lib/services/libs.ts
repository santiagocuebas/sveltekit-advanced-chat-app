import type { Member, RawUser } from "$lib/types/global";
import { goto } from '$app/navigation';
import jsCookie from 'js-cookie';
import axios from "$lib/axios";
import { socket } from '$lib/socket';
import { user, register } from '$lib/store';
import { Option } from "$lib/types/enums";

export const connectSocket = (
	rawUser: RawUser,
	token: string,
	isRedirect?: boolean
) => {
	user.setUser(rawUser);

	jsCookie.set('authenticate', token, {
		expires: 15,
		path: '/',
		sameSite: 'lax',
		secure: location.protocol === 'https'
	});

	if (isRedirect) {
		axios.defaults.headers.common['Authorization'] = token;
		register.resetOptions();
		goto('/');
	}

	setTimeout(() => {
		socket.auth = { sessionID: rawUser.id, token };
		socket.connect();
		register.setOption(Option.USER);
	}, 3000);
};

export const changeName = (value: string) => {
	const firstLetter = value.at(0) as string;
	return value.replace(firstLetter, firstLetter.toUpperCase());
};

export const addId = ({ id }: Member, list: string[]) => {
	return !list.includes(id) ? [id, ...list] : list.filter(item => item !== id);
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
