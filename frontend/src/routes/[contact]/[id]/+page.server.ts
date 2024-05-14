import type { IChat, RegisterData } from '$lib/types/global';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import axios from '$lib/axios';

export const load = (async ({ parent, cookies, params }) => {
	const parentData = await parent() as RegisterData;

	const data: IChat[] | null = await axios({
		url: `/home/chats?id=${params.id}&skip=${0}&type=${params.contact}`,
		headers: { Authorization: parentData.token }
	}).then(res => res.data)
		.catch(err => {
			console.error('Network Error:', err.response?.data);
			cookies.delete('authenticate', { path: '/' });
			throw redirect(307, '/register');
		});

	return { chats: data };
}) satisfies PageServerLoad;
