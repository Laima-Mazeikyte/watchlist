<script lang="ts">
	import { enhance } from '$app/forms';
	import { Film, LogOut, Plus, CheckCircle, RotateCcw, Search, Trash2, ClipboardPaste } from 'lucide-svelte';
	import {
		Button,
		Input,
		ItemList,
		Label,
		ListItem,
		Modal,
		Section,
		Toolbar
	} from '$lib/components';
	import type { ListEntry, ListItemAction } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let importModalOpen = $state(false);
	let addSubmittingByTmdbId = $state<number | null>(null);
	let importSubmitting = $state(false);

	const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p';
	function posterUrl(path: string | null, size: string = 'w154'): string | null {
		if (!path) return null;
		return `${TMDB_POSTER_BASE}/${size}${path}`;
	}
	const movies = $derived(data.movies as ListEntry[]);

	function getItemActions(item: ListEntry): ListItemAction[] {
		if (item.watched) {
			return [
				{
					formAction: '?/markUnwatched',
					method: 'post',
					hiddenFields: [{ name: 'id', value: item.id }],
					label: 'Mark as unwatched',
					ariaLabel: 'Mark as unwatched',
					icon: RotateCcw
				}
			];
		}
		return [
			{
				formAction: '?/markWatched',
				method: 'post',
				hiddenFields: [{ name: 'id', value: item.id }],
				label: 'Mark as watched',
				ariaLabel: 'Mark as watched',
				icon: CheckCircle
			}
		];
	}

	// Scrap (remove) action — rendered below the card
	function getScrapAction(item: ListEntry): ListItemAction {
		return {
			formAction: '?/deleteMovie',
			method: 'post',
			hiddenFields: [{ name: 'id', value: item.id }],
			label: 'Scrap',
			ariaLabel: 'Scrap',
			icon: Trash2
		};
	}
</script>

{#snippet emptyListIcon()}
	<Film size={20} aria-hidden="true" />
{/snippet}

<main class="app">
	<Toolbar>
		{#snippet title()}
			<Film size={24} class="title-icon" aria-hidden="true" />
			Watchlist
		{/snippet}
		{#snippet user()}
			<span class="signed-in">Signed in as <strong>{data.user.name}</strong></span>
			<form method="post" action="?/signOut" use:enhance>
				<Button variant="ghost" size="small" type="submit" ariaLabel="Logout">
					{#snippet children()}
						<LogOut size={16} aria-hidden="true" />
						Logout
					{/snippet}
				</Button>
			</form>
		{/snippet}
	</Toolbar>

	<div class="page">
		<Section title="Add a movie" titleId="add-heading">
			{#snippet headerAction()}
				<Button
					variant="ghost"
					size="small"
					type="button"
					class="btn--action"
					ariaHaspopup="dialog"
					ariaExpanded={importModalOpen}
					onclick={() => (importModalOpen = true)}
				>
					{#snippet children()}
						<ClipboardPaste size={16} aria-hidden="true" />
						<span class="btn-label">Import movies</span>
					{/snippet}
				</Button>
			{/snippet}
			{#snippet children()}
				{#if !data.tmdbConfigured}
					<p class="error" role="alert">TMDB is not configured. Add TMDB_API_KEY to enable adding movies.</p>
				{:else}
					<div class="add-row">
						<form method="get" action="." class="form form--add">
							<Label for="search" visuallyHidden>Search for a movie</Label>
							<div class="search-input-wrap">
								<Search size={18} class="search-input-icon" aria-hidden="true" />
								<Input
									id="search"
									name="search"
									type="search"
									placeholder="Search for a movie…"
									value={data.searchQuery ?? ''}
									class="input--full input--with-icon"
								/>
							</div>
						</form>
					</div>
					{#if form?.message}
						<p role="alert" aria-live="polite" class="error">{form.message}</p>
					{/if}
					{#if data.searchQuery && data.searchResults.length === 0}
						<p class="muted">No results for "{data.searchQuery}". Try a different search.</p>
					{:else if data.searchResults.length > 0}
						<ul class="search-results" aria-label="Search results">
							{#each data.searchResults as result (result.id)}
								<li class="search-result-item">
									{#if posterUrl(result.poster_path)}
										<img
											src={posterUrl(result.poster_path)!}
											alt=""
											class="search-result-poster"
											width="92"
											height="138"
										/>
									{:else}
										<span class="search-result-poster search-result-poster--placeholder" aria-hidden="true">
											<Film size={32} />
										</span>
									{/if}
									<div class="search-result-info">
										<span class="search-result-title">{result.title}</span>
										{#if result.release_date}
											<span class="search-result-year"
												>{result.release_date.slice(0, 4)}</span
											>
										{/if}
									</div>
									<form
										method="post"
										action="?/addMovieFromTmdb"
										use:enhance={() => {
											addSubmittingByTmdbId = result.id;
											return async ({ result: res, update }) => {
												try {
													await update();
												} finally {
													addSubmittingByTmdbId = null;
												}
											};
										}}
										class="search-result-form"
									>
										<input type="hidden" name="tmdb_id" value={result.id} />
										<Button
											variant="primary"
											type="submit"
											disabled={addSubmittingByTmdbId === result.id}
										>
											{#snippet children()}
												<Plus size={18} aria-hidden="true" />
												{addSubmittingByTmdbId === result.id ? 'Adding…' : 'Add'}
											{/snippet}
										</Button>
									</form>
								</li>
							{/each}
						</ul>
					{/if}
				{/if}

				<Modal
					open={importModalOpen}
					onClose={() => (importModalOpen = false)}
					title="Import list"
					titleId="import-dialog-title"
				>
					{#snippet children()}
						<form
							method="post"
							action="?/importMovies"
							enctype="multipart/form-data"
							use:enhance={({ formElement }) => {
								return async ({ result, update }) => {
									importSubmitting = true;
									try {
										await update();
										if (result.type === 'success' && result.data?.importSuccess) {
											formElement.reset();
											importModalOpen = false;
										}
									} finally {
										importSubmitting = false;
									}
								};
							}}
							class="form form--import"
						>
							<p class="form--import-description">
								Pick a CSV file from your device. It should have a header row with a Title (or Film name) column—each row will be added as a movie to your watchlist.
							</p>
							<div class="form--import-fields">
								<Label for="import-file">CSV file</Label>
								<Input
									id="import-file"
									name="file"
									type="file"
									accept=".csv"
									disabled={importSubmitting}
									class="input--file"
								/>
							</div>
							{#if form?.importSuccess && form?.importCount != null}
								<p role="status" aria-live="polite" class="success">Added {form.importCount} movie{form.importCount === 1 ? '' : 's'}.</p>
							{:else if form?.importError}
								<p role="alert" aria-live="polite" class="error">{form.importError}</p>
							{/if}
							<div class="form--import-actions">
								<Button variant="primary" type="submit" disabled={importSubmitting}>
									{#snippet children()}
										<Plus size={18} aria-hidden="true" />
										{importSubmitting ? 'Importing…' : 'Import'}
									{/snippet}
								</Button>
							</div>
						</form>
					{/snippet}
				</Modal>
			{/snippet}
		</Section>

		<ItemList
			title="Your list"
			titleId="list-heading"
			items={movies}
			emptyMessage="No movies yet. Add one above."
			emptyIcon={emptyListIcon}
		>
			{#snippet children(item)}
				<ListItem
					item={item}
					actions={getItemActions(item)}
					mainActionLabel={item.watched ? 'UNWATCHED' : 'WATCHED IT!'}
					scrapAction={getScrapAction(item)}
				/>
			{/snippet}
		</ItemList>
	</div>
</main>

<style>
	.app {
		min-height: 100%;
	}

	.page {
		max-width: 36rem;
		margin: 0 auto;
		padding: var(--space-7) var(--space-5);
	}

	.add-row {
		display: flex;
		width: 100%;
	}

	.form--add {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
	}

	.header-action-form {
		display: inline;
		margin: 0;
	}

	.form--add :global(.label) {
		margin-bottom: 0;
	}

	.search-input-wrap {
		position: relative;
		width: 100%;
	}

	.search-input-wrap :global(.search-input-icon) {
		position: absolute;
		left: var(--space-3);
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
		color: var(--color-text-muted);
	}

	.search-input-wrap :global(.input--with-icon) {
		padding-left: 2.5rem;
		width: 100%;
	}

	.form--import {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-4);
	}

	.form--import-description {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.form--import-fields {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		width: 100%;
		min-width: 0;
	}

	.form--import-actions {
		display: flex;
		justify-content: flex-start;
		width: 100%;
		margin-top: var(--space-2);
	}

	.error {
		margin: var(--space-2) 0 0;
		font-size: var(--font-size-sm);
		color: var(--color-error);
	}

	.success {
		margin: var(--space-2) 0 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.muted {
		margin: var(--space-3) 0 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.search-results {
		list-style: none;
		margin: var(--space-4) 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.search-result-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2);
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.search-result-poster {
		width: 92px;
		height: 138px;
		object-fit: cover;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.search-result-poster--placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg);
		color: var(--color-text-muted);
	}

	.search-result-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.search-result-title {
		font-weight: 600;
	}

	.search-result-year {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.search-result-form {
		flex-shrink: 0;
		margin: 0;
	}
</style>
