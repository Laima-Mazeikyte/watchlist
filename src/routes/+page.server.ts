import { fail, redirect } from '@sveltejs/kit';
import { and, desc, eq, isNull } from 'drizzle-orm';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { movie } from '$lib/server/db/schema';
import { parseCSV } from '$lib/server/import/parsers';
import {
	findBestMatch,
	getMovieById,
	isTmdbConfigured,
	searchMovies
} from '$lib/server/tmdb';

function parseMovieId(formData: FormData): number | null {
	const raw = formData.get('id') ?? formData.get('movieId');
	const n = raw != null ? parseInt(raw.toString(), 10) : NaN;
	return Number.isInteger(n) && n > 0 ? n : null;
}

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const userId = event.locals.user.id;
	const watchlist = await db.query.movie.findMany({
		where: and(eq(movie.userId, userId), eq(movie.watched, false)),
		columns: { id: true, title: true, favorite: true, poster_path: true },
		orderBy: desc(movie.id)
	});
	const watched = await db.query.movie.findMany({
		where: and(eq(movie.userId, userId), eq(movie.watched, true)),
		columns: { id: true, title: true, favorite: true, poster_path: true },
		orderBy: desc(movie.id)
	});

	const searchQuery = event.url.searchParams.get('search')?.trim() ?? '';
	const searchYearParam = event.url.searchParams.get('year');
	const searchYear = searchYearParam ? parseInt(searchYearParam, 10) : undefined;
	const searchYearValid =
		searchYear !== undefined && Number.isInteger(searchYear) ? searchYear : undefined;

	let searchResults: Awaited<ReturnType<typeof searchMovies>> = [];
	if (searchQuery) {
		searchResults = await searchMovies(searchQuery, searchYearValid);
	}

	return {
		user: event.locals.user,
		watchlist,
		watched,
		searchResults,
		searchQuery: searchQuery || undefined,
		tmdbConfigured: isTmdbConfigured()
	};
};

export const actions: Actions = {
	addMovieFromTmdb: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const tmdbIdRaw = formData.get('tmdb_id')?.toString();
		const tmdbId = tmdbIdRaw ? parseInt(tmdbIdRaw, 10) : NaN;
		if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
			return fail(400, { message: 'Please select a movie from the search results.' });
		}
		const details = await getMovieById(tmdbId);
		if (!details) {
			return fail(502, { message: 'Could not load movie details. Try again.' });
		}
		await db.insert(movie).values({
			title: details.title,
			year: details.year,
			tmdb_id: details.id,
			poster_path: details.poster_path,
			userId: event.locals.user.id
		});
		return redirect(302, '/');
	},
	deleteMovie: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const id = parseMovieId(await event.request.formData());
		if (id == null) {
			return fail(400, { message: 'Invalid movie' });
		}
		await db
			.delete(movie)
			.where(and(eq(movie.id, id), eq(movie.userId, event.locals.user.id)));
		return redirect(302, '/');
	},
	markWatched: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const id = parseMovieId(await event.request.formData());
		if (id == null) {
			return fail(400, { message: 'Invalid movie' });
		}
		await db
			.update(movie)
			.set({ watched: true })
			.where(and(eq(movie.id, id), eq(movie.userId, event.locals.user.id)));
		return redirect(302, '/');
	},
	markUnwatched: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const id = parseMovieId(await event.request.formData());
		if (id == null) {
			return fail(400, { message: 'Invalid movie' });
		}
		await db
			.update(movie)
			.set({ watched: false })
			.where(and(eq(movie.id, id), eq(movie.userId, event.locals.user.id)));
		return redirect(302, '/');
	},
	toggleFavorite: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const id = parseMovieId(await event.request.formData());
		if (id == null) {
			return fail(400, { message: 'Invalid movie' });
		}
		const [current] = await db
			.select({ favorite: movie.favorite })
			.from(movie)
			.where(and(eq(movie.id, id), eq(movie.userId, event.locals.user.id)))
			.limit(1);
		if (!current) {
			return fail(404, { message: 'Movie not found' });
		}
		await db
			.update(movie)
			.set({ favorite: !current.favorite })
			.where(and(eq(movie.id, id), eq(movie.userId, event.locals.user.id)));
		return {};
	},
	importMovies: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const file = formData.get('file');
		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { importError: 'Please choose a file to import.' });
		}
		if (!file.name.toLowerCase().endsWith('.csv')) {
			return fail(400, { importError: 'File must be a CSV.' });
		}
		let content: string;
		try {
			content = await file.text();
		} catch {
			return fail(400, { importError: 'Could not read file. Use UTF-8 text.' });
		}
		const entries = parseCSV(content).filter(
			(e) => e.title.trim().length > 0
		);
		if (entries.length === 0) {
			return fail(400, { importError: 'No movies found in this file.' });
		}
		const userId = event.locals.user.id;
		const values: Array<{
			title: string;
			year: number | null;
			userId: string;
			tmdb_id: number | null;
			poster_path: string | null;
		}> = [];
		for (const e of entries) {
			const match = await findBestMatch(e.title.trim(), e.year ?? undefined);
			values.push({
				title: match?.title ?? e.title.trim(),
				year: match?.year ?? e.year ?? null,
				userId,
				tmdb_id: match?.id ?? null,
				poster_path: match?.poster_path ?? null
			});
			// Small delay to avoid TMDB rate limits
			await new Promise((r) => setTimeout(r, 150));
		}
		await db.insert(movie).values(values);
		return { importSuccess: true, importCount: entries.length };
	},
	backfillPosters: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		if (!isTmdbConfigured()) {
			return fail(503, { backfillError: 'TMDB is not configured.' });
		}
		const userId = event.locals.user.id;
		const missing = await db
			.select({ id: movie.id, title: movie.title, year: movie.year })
			.from(movie)
			.where(and(eq(movie.userId, userId), isNull(movie.poster_path)));
		let updated = 0;
		for (const row of missing) {
			const match = await findBestMatch(row.title, row.year ?? undefined);
			if (match) {
				await db
					.update(movie)
					.set({
						poster_path: match.poster_path,
						tmdb_id: match.id,
						title: match.title,
						year: match.year
					})
					.where(and(eq(movie.id, row.id), eq(movie.userId, userId)));
				updated++;
			}
			await new Promise((r) => setTimeout(r, 150));
		}
		return { backfillSuccess: true, backfillCount: updated };
	},
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/login');
	}
};
