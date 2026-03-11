import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchMovies, isTmdbConfigured } from '$lib/server/tmdb';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!isTmdbConfigured()) {
		return json({ error: 'TMDB not configured' }, { status: 503 });
	}

	const query = event.url.searchParams.get('q')?.trim() ?? '';
	if (!query) {
		return json([]);
	}

	const yearParam = event.url.searchParams.get('year');
	const year = yearParam ? parseInt(yearParam, 10) : undefined;
	const yearValid = year !== undefined && Number.isInteger(year) ? year : undefined;

	const results = await searchMovies(query, yearValid);
	return json(results);
};
