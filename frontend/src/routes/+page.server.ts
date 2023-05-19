import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import axios from 'axios';
import { DIR } from '$lib/config';

export const load = (async ({ cookies }) => {
	const token = cookies.get('session.id');

	const data = await axios({
		method: 'GET',
		url: DIR + '/api/main',
		headers: { 'Cookie': `session.id=${token}` }
	}).then(res => res.data);

	if (data.error) throw redirect(307, '/signin');

	return {
		user: data.user
	}
}) satisfies PageServerLoad;
