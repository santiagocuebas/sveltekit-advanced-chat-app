import type { LayoutServerLoad } from './$types';
import type { RegisterData } from '$lib/types/global';
import { redirect } from '@sveltejs/kit';
import axios from '$lib/axios';

export const load = (async ({ cookies, url }) => {
	const token = cookies.get('authenticate');

	if (url.pathname.includes('register')) {
		if (token) throw redirect(307, '/');
		return { };
	} else if (!token) throw redirect(307, '/register');

	const data: RegisterData = await axios({
		url: '/auth',
		headers: { Authorization: token }
	}).then(res => res.data)
		.catch(() => {
			console.error('Network Error');
			cookies.delete('authenticate', { path: '/' });
			throw redirect(307, '/register');
		});

	return data;
}) satisfies LayoutServerLoad;
