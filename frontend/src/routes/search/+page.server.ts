import type { PageServerLoad } from './$types';
import axios from '$lib/axios';

export const load = (async ({ url, cookies }) => {
	const token = cookies.get('authenticate')
	const searchParams = url.searchParams.get('q');

	return axios({
		url: '/home/search?param=' + searchParams,
		headers: { Authorization: token }
	}).then(res => res.data)
		.catch(err => {
			console.error(err.message);
			return { contacts: [] };
		});
}) satisfies PageServerLoad;
