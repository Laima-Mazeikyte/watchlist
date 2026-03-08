export type MovieEntry = { title: string; year: number | null };

const TITLE_YEAR_REGEX = /^(.*?)\s*\((\d{4})\)\s*$/;

/**
 * Extract title and year from a string like "Inception (2010)" or "3 Women (1977)".
 */
export function parseTitleYear(text: string): MovieEntry | null {
	const trimmed = text.trim();
	const match = trimmed.match(TITLE_YEAR_REGEX);
	if (!match) return null;
	const [, title, yearStr] = match;
	const titleTrimmed = title.trim();
	if (!titleTrimmed) return null;
	const year = parseInt(yearStr, 10);
	return { title: titleTrimmed, year: Number.isInteger(year) ? year : null };
}

/**
 * Parse a CSV line respecting quoted fields (commas inside quotes don't split).
 */
function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (c === '"') {
			inQuotes = !inQuotes;
		} else if ((c === ',' && !inQuotes) || (c === '\n' && !inQuotes)) {
			result.push(current.trim());
			current = '';
			if (c === '\n') break;
		} else {
			current += c;
		}
	}
	result.push(current.trim());
	return result;
}

/**
 * Split CSV content into lines, then parse each line. First line is header.
 */
function parseCSVRows(content: string): { header: string[]; rows: string[][] } {
	const lines = content.split(/\r?\n/).filter((l) => l.length > 0);
	if (lines.length === 0) return { header: [], rows: [] };
	const header = parseCSVLine(lines[0]).map((c) => c.trim());
	const rows = lines.slice(1).map((l) => parseCSVLine(l));
	return { header, rows };
}

function findColumnIndex(header: string[], names: string[]): number {
	const normalized = header.map((h) => h.toLowerCase().trim());
	for (const name of names) {
		const idx = normalized.indexOf(name.toLowerCase());
		if (idx !== -1) return idx;
	}
	return -1;
}

/**
 * Parse CSV content (IMDb, Criticker, or generic with Title/Film Name + Year columns).
 */
export function parseCSV(content: string): MovieEntry[] {
	const { header, rows } = parseCSVRows(content);
	if (header.length === 0) return [];

	const titleIdx = findColumnIndex(header, ['title', 'film name', 'name']);
	const yearIdx = findColumnIndex(header, ['year']);

	const entries: MovieEntry[] = [];
	for (const row of rows) {
		let title = titleIdx >= 0 && row[titleIdx] !== undefined ? row[titleIdx].trim() : '';
		let year: number | null = null;

		if (yearIdx >= 0 && row[yearIdx] !== undefined) {
			const yearVal = row[yearIdx].trim();
			const num = parseInt(yearVal, 10);
			if (Number.isInteger(num)) year = num;
			else {
				const parsed = parseTitleYear(yearVal);
				if (parsed) year = parsed.year;
			}
		}

		if (!title && (titleIdx < 0 || yearIdx < 0)) {
			for (const cell of row) {
				const parsed = parseTitleYear(cell);
				if (parsed) {
					entries.push(parsed);
					break;
				}
			}
			continue;
		}

		if (!title) continue;

		const fromTitle = parseTitleYear(title);
		if (fromTitle) {
			entries.push({ title: fromTitle.title, year: year ?? fromTitle.year });
		} else {
			entries.push({ title, year });
		}
	}
	return entries;
}
