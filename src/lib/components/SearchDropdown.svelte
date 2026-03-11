<script lang="ts">
	import { enhance } from '$app/forms';
	import { Film, Plus, Search, X } from 'lucide-svelte';

	interface SearchResult {
		id: number;
		title: string;
		release_date: string | null;
		poster_path: string | null;
	}

	interface Props {
		tmdbConfigured?: boolean;
	}

	let { tmdbConfigured = true }: Props = $props();

	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let isOpen = $state(false);
	let isLoading = $state(false);
	let highlightedIndex = $state(-1);
	let addingId = $state<number | null>(null);

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let containerRef: HTMLDivElement | undefined = $state();
	let inputRef: HTMLInputElement | undefined = $state();

	const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p';
	function posterUrl(path: string | null, size: string = 'w92'): string | null {
		if (!path) return null;
		return `${TMDB_POSTER_BASE}/${size}${path}`;
	}

	function getYear(releaseDate: string | null): string {
		if (!releaseDate || releaseDate.length < 4) return '';
		return releaseDate.slice(0, 4);
	}

	async function search(q: string) {
		if (!q.trim()) {
			results = [];
			isOpen = false;
			return;
		}

		isLoading = true;
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
			if (res.ok) {
				results = await res.json();
				isOpen = results.length > 0;
				highlightedIndex = -1;
			}
		} catch {
			results = [];
		} finally {
			isLoading = false;
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;

		if (debounceTimer) clearTimeout(debounceTimer);

		if (!query.trim()) {
			results = [];
			isOpen = false;
			return;
		}

		debounceTimer = setTimeout(() => {
			search(query);
		}, 300);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) {
			if (e.key === 'Enter' && query.trim()) {
				e.preventDefault();
				search(query);
			}
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				highlightedIndex = Math.min(highlightedIndex + 1, results.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightedIndex = Math.max(highlightedIndex - 1, -1);
				break;
			case 'Enter':
				e.preventDefault();
				if (highlightedIndex >= 0 && results[highlightedIndex]) {
					const form = containerRef?.querySelector(
						`[data-result-id="${results[highlightedIndex].id}"] button`
					) as HTMLButtonElement;
					form?.click();
				}
				break;
			case 'Escape':
				closeDropdown();
				break;
		}
	}

	function closeDropdown() {
		isOpen = false;
		highlightedIndex = -1;
	}

	function clearSearch() {
		query = '';
		results = [];
		isOpen = false;
		inputRef?.focus();
	}

	function handleClickOutside(e: MouseEvent) {
		if (containerRef && !containerRef.contains(e.target as Node)) {
			closeDropdown();
		}
	}

	function handleAddComplete() {
		clearSearch();
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="search-dropdown" bind:this={containerRef}>
	<div class="search-input-container">
		<Search size={18} class="search-icon" aria-hidden="true" />
		<input
			bind:this={inputRef}
			type="search"
			placeholder="Add a movie to watch"
			value={query}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={() => results.length > 0 && (isOpen = true)}
			class="search-input"
			aria-label="Add a movie to watch"
			aria-expanded={isOpen}
			aria-controls="search-results"
			aria-autocomplete="list"
			disabled={!tmdbConfigured}
		/>
		{#if query}
			<button type="button" class="clear-btn" onclick={clearSearch} aria-label="Clear search">
				<X size={16} />
			</button>
		{/if}
		{#if isLoading}
			<span class="loading-indicator" aria-hidden="true"></span>
		{/if}
	</div>

	{#if isOpen && results.length > 0}
		<div class="dropdown" id="search-results" role="listbox">
			<ul class="results-full">
				{#each results.slice(0, 5) as result, i (result.id)}
					<li
						class="result-item-full"
						class:highlighted={i === highlightedIndex}
						data-result-id={result.id}
						role="option"
						aria-selected={i === highlightedIndex}
					>
						{#if posterUrl(result.poster_path)}
							<img
								src={posterUrl(result.poster_path)}
								alt=""
								class="result-poster"
								width="46"
								height="69"
							/>
						{:else}
							<span class="result-poster result-poster--placeholder" aria-hidden="true">
								<Film size={20} />
							</span>
						{/if}
						<div class="result-info">
							<span class="result-title">{result.title}</span>
							{#if getYear(result.release_date)}
								<span class="result-year">{getYear(result.release_date)}</span>
							{/if}
						</div>
						<form
							method="post"
							action="?/addMovieFromTmdb"
							use:enhance={() => {
								addingId = result.id;
								return async ({ update }) => {
									await update();
									addingId = null;
									handleAddComplete();
								};
							}}
							class="result-form"
						>
							<input type="hidden" name="tmdb_id" value={result.id} />
							<button
								type="submit"
								class="add-btn"
								disabled={addingId === result.id}
								aria-label="Add {result.title}"
							>
								<Plus size={16} aria-hidden="true" />
								{addingId === result.id ? 'Adding...' : 'Add'}
							</button>
						</form>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.search-dropdown {
		position: relative;
		width: 100%;
		flex: 1;
	}

	.search-input-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-input-container :global(.search-icon) {
		position: absolute;
		left: 0;
		color: var(--color-text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		height: 2.25rem;
		padding: var(--space-2) var(--space-8) var(--space-2) 2.25rem;
		font: inherit;
		font-size: var(--font-size-sm);
		color: var(--color-text);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--color-border);
		border-radius: 0;
		transition: border-color 0.15s;
	}

	.search-input::placeholder {
		color: var(--color-text-muted);
	}

	.search-input:focus {
		outline: none;
		border-bottom-color: var(--color-text-strong);
	}

	.search-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.clear-btn {
		position: absolute;
		right: var(--space-2);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		color: var(--color-text-muted);
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: color 0.15s;
	}

	.clear-btn:hover {
		color: var(--color-text);
	}

	.loading-indicator {
		position: absolute;
		right: var(--space-3);
		width: 1rem;
		height: 1rem;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.dropdown {
		position: absolute;
		top: calc(100% + var(--space-1));
		left: 0;
		right: 0;
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
		z-index: 100;
		overflow: hidden;
	}

	.results-full {
		list-style: none;
		margin: 0;
		padding: var(--space-1) 0;
	}

	.result-item-full {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		transition: background-color 0.1s;
	}

	.result-item-full.highlighted,
	.result-item-full:hover {
		background: var(--color-accent-hover-muted);
	}

	.result-poster {
		width: 46px;
		height: 69px;
		object-fit: cover;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.result-poster--placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg);
		color: var(--color-text-muted);
	}

	.result-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.result-title {
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.result-year {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.result-form {
		flex-shrink: 0;
	}

	.add-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		font: inherit;
		font-size: var(--font-size-xs);
		font-weight: 500;
		color: var(--color-text-muted);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: color 0.15s;
	}

	.add-btn:hover:not(:disabled) {
		color: var(--color-text);
	}

	.add-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
