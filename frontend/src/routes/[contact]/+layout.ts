import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	if (
		(params.contact === 'users' || params.contact === 'groups') && params.id
	) return {};

	throw redirect(307, '/');
}) satisfies LayoutLoad;
