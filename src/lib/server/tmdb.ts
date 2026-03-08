import { env } from '$env/dynamic/private';

const TMDB_BASE = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
	id: number;
	title: string;
	release_date: string | null;
	poster_path: string | null;
}

interface TMDBSearchResponse {
	results?: Array<{
		id: number;
		title: string;
		release_date: string | null;
		poster_path: string | null;
	}>;
}

function getApiKey(): string | undefined {
	return env.TMDB_API_KEY?.trim() || undefined;
}

/**
 * Search TMDB for movies by query and optional year.
 * Returns empty array if API key is missing or request fails.
 */
export async function searchMovies(
	query: string,
	year?: number
): Promise<TMDBMovie[]> {
	const key = getApiKey();
	if (!key) return [];

	const trimmed = query.trim();
	if (!trimmed) return [];

	const url = new URL(`${TMDB_BASE}/search/movie`);
	url.searchParams.set('query', trimmed);
	if (year != null && Number.isInteger(year)) {
		url.searchParams.set('primary_release_year', String(year));
	}

	try {
		const res = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${key}` }
		});
		if (!res.ok) return [];
		const data = (await res.json()) as TMDBSearchResponse;
		const results = data.results ?? [];
		return results.map((r) => ({
			id: r.id,
			title: r.title,
			release_date: r.release_date ?? null,
			poster_path: r.poster_path ?? null
		}));
	} catch {
		return [];
	}
}

/**
 * Extract year from TMDB release_date (e.g. "2010-07-16" -> 2010).
 */
function yearFromReleaseDate(release_date: string | null): number | null {
	if (!release_date || release_date.length < 4) return null;
	const y = parseInt(release_date.slice(0, 4), 10);
	return Number.isInteger(y) ? y : null;
}

/**
 * Find best matching movie on TMDB for a title and optional year.
 * Used for import and backfill. Returns null if no match or API key missing.
 */
export async function findBestMatch(
	title: string,
	year?: number
): Promise<{ id: number; title: string; year: number | null; poster_path: string | null } | null> {
	const results = await searchMovies(title, year);
	if (results.length === 0) return null;

	const first = results[0];
	const resultYear = yearFromReleaseDate(first.release_date);
	return {
		id: first.id,
		title: first.title,
		year: resultYear,
		poster_path: first.poster_path
	};
}

/**
 * Fetch movie details by TMDB id. Used when adding a movie from search.
 */
export async function getMovieById(
	tmdbId: number
): Promise<{ id: number; title: string; year: number | null; poster_path: string | null } | null> {
	const key = getApiKey();
	if (!key) return null;

	try {
		const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}`, {
			headers: { Authorization: `Bearer ${key}` }
		});
		if (!res.ok) return null;
		const data = (await res.json()) as {
			id: number;
			title?: string;
			release_date?: string | null;
			poster_path?: string | null;
		};
		const year = data.release_date
			? yearFromReleaseDate(data.release_date)
			: null;
		return {
			id: data.id,
			title: data.title ?? '',
			year,
			poster_path: data.poster_path ?? null
		};
	} catch {
		return null;
	}
}

/**
 * Check if TMDB is configured (API key present).
 */
export function isTmdbConfigured(): boolean {
	return !!getApiKey();
}
