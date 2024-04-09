import type { PageLoad } from './$types';
import axios from '$lib/axios';

export const load = (async ({ url }) => {
	const searchParams = url.searchParams.get('q');

	return axios({ url: '/search/' + searchParams })
		.then(res => res.data)
		.catch(err => {
			console.error(err.message);
			return { contacts: [] };
		});
}) satisfies PageLoad;
