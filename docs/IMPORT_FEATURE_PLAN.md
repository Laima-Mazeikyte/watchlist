# Import movie lists – implementation plan

Based on the main plan plus **user-provided example files** for CSV and TXT.

## 1. Schema: add `year` column

- **File:** `src/lib/server/db/schema.ts`
- Add optional `year` column to `movie` table (e.g. `integer('year')` nullable).
- Add a Drizzle migration and run it.

## 2. Backend: parsers and import action

- **New module:** `src/lib/server/import/parsers.ts`
  - One parser per format (XML, HTML, TXT, CSV), each returning `Array<{ title: string; year: number | null }>`.
  - **Heuristic:** Shared helper `parseTitleYear(text: string)` — regex for `(.*?)\s*\((\d{4})\)` to get title and year from strings like `"Inception (2010)"`.
- **File:** `src/routes/+page.server.ts` — new action `importMovies`: accept file + optional format, validate user, run parser, bulk-insert, redirect or return errors.

### Documented formats (from user examples)

**IMDb CSV** (e.g. `78f153bd-54bc-41ee-92c1-8ae2900cb8ce.csv`)
- Header: `Position,Const,Created,Modified,Description,Title,Original Title,URL,Title Type,IMDb Rating,Runtime (mins),Year,...`
- Use columns **Title** (index 5) and **Year** (index 11). Year is numeric.

**Criticker CSV** (e.g. `criticker-watchlist-260308063606.csv`)
- Header: `PSI, Film Name, Year, Rating, ...` — **trim header names** (e.g. ` Film Name` → `Film Name`).
- Use **Film Name** and **Year**. First column (PSI) can be empty; rows may have leading comma.
- CSV has quoted fields and commas inside values; need a proper CSV parser.

**Criticker TXT** (e.g. `criticker-watchlist-260308063613.txt`)
- Block-based: blocks separated by blank line(s). Each block:
  - First line: optional rating number + tab + `Title (Year)` (e.g. `	3 Women (1977)` or `83	Blow-Up (1966)`).
  - Then `Summary: ...` and a URL line.
- **Parsing:** Split content by `\n\n+`. For each block, take the first line, strip leading `\d*\t`, then run `parseTitleYear()` on the remainder. Ignore blocks whose first line doesn’t match "Title (Year)".

**CSV parser strategy**
- Parse first row as header; trim each cell for column-name matching.
- Title column: match (case-insensitive) `title`, `film name`, `name`.
- Year column: match `year`. If value is numeric, use it; else try `parseTitleYear` on the cell or look for 4-digit number.
- Use a CSV parser that handles quoted fields and commas inside quotes (e.g. hand-rolled or lightweight lib).

**TXT parser strategy**
- Primary: Criticker-style — split by `\n\n+`, first line per block → strip `\d*\t` → `parseTitleYear()`.
- Fallback: every non-empty line → `parseTitleYear(line)` (for simple "Title (Year)" per line).

**XML/HTML**
- No user examples yet; keep generic or return empty until examples are provided.

## 3. Frontend: import UI next to manual add

- **File:** `src/routes/+page.svelte`
- In “Add a movie” section, add “Import list”: file input (accept `.xml,.html,.htm,.txt,.csv`), optional format dropdown, submit to `?/importMovies`. Reuse form styling; show “Added N movies” or error.

## 4. Edge cases

- Duplicates: no deduplication; same movie can be added multiple times.
- Encoding: assume UTF-8 for uploads.
- Empty or invalid files: return clear error (e.g. “No movies found”, “Unsupported format”).

## 5. Files to add/change

| Path | Change |
|------|--------|
| `src/lib/server/db/schema.ts` | Add nullable `year` to `movie` |
| `drizzle/XXXX_*.sql` | Migration adding `year` |
| `src/lib/server/import/parsers.ts` | New; `parseTitleYear`, CSV/TXT (and stub XML/HTML) parsers |
| `src/routes/+page.server.ts` | New `importMovies` action |
| `src/routes/+page.svelte` | Import block in “Add a movie” section |
| `package.json` | Optional: CSV/XML parser dependency |
