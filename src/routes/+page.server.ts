import { fail, redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { movie } from '$lib/server/db/schema';
import { parseCSV } from '$lib/server/import/parsers';

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
		columns: { id: true, title: true, favorite: true },
		orderBy: desc(movie.id)
	});
	const watched = await db.query.movie.findMany({
		where: and(eq(movie.userId, userId), eq(movie.watched, true)),
		columns: { id: true, title: true, favorite: true },
		orderBy: desc(movie.id)
	});
	return { user: event.locals.user, watchlist, watched };
};

export const actions: Actions = {
	addMovie: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const title = formData.get('title')?.toString()?.trim() ?? '';
		if (!title) {
			return fail(400, { message: 'Title is required' });
		}
		await db.insert(movie).values({
			title,
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
		await db.insert(movie).values(
			entries.map((e) => ({
				title: e.title.trim(),
				year: e.year,
				userId
			}))
		);
		return { importSuccess: true, importCount: entries.length };
	},
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/login');
	}
};
