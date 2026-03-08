<script lang="ts">
	import { enhance } from '$app/forms';
	import { Film, LogOut, Plus, Check, RotateCcw, Trash2, Star, Upload, X } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let filterWatchlistByFavorites = $state(false);
	let filterWatchedByFavorites = $state(false);
	let importModalOpen = $state(false);

	$effect(() => {
		if (!importModalOpen) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') importModalOpen = false;
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	});

	const watchlistFiltered = $derived(
		filterWatchlistByFavorites ? data.watchlist.filter((m) => m.favorite) : data.watchlist
	);
	const watchedFiltered = $derived(
		filterWatchedByFavorites ? data.watched.filter((m) => m.favorite) : data.watched
	);
</script>

<main class="page">
	<header class="header">
		<h1 class="title">
			<Film size={24} class="title-icon" aria-hidden="true" />
			Watchlist
		</h1>
		<div class="header-actions">
			<span class="signed-in">Signed in as <strong>{data.user.name}</strong></span>
			<form method="post" action="?/signOut" use:enhance>
				<button type="submit" class="btn btn--secondary btn--icon">
					<LogOut size={18} aria-hidden="true" />
					Sign out
				</button>
			</form>
		</div>
	</header>

	<section class="section" aria-labelledby="add-heading">
		<h2 id="add-heading" class="section-title">Add a movie</h2>
		<div class="add-row">
			<form
				method="post"
				action="?/addMovie"
				use:enhance={({ formElement }) => {
					return async ({ result, update }) => {
						await update();
						if (result.type === 'redirect') formElement.reset();
					};
				}}
				class="form form--inline"
			>
				<label for="title" class="label">Title</label>
				<input id="title" type="text" name="title" required autocomplete="off" class="input" />
				<button type="submit" class="btn btn--primary btn--icon">
					<Plus size={18} aria-hidden="true" />
					Add movie
				</button>
				<button
					type="button"
					class="btn btn--secondary btn--icon"
					onclick={() => (importModalOpen = true)}
					aria-haspopup="dialog"
					aria-expanded={importModalOpen}
				>
					<Upload size={18} aria-hidden="true" />
					Import movies
				</button>
				{#if form?.message}
					<p role="alert" aria-live="polite" class="error">{form.message}</p>
				{/if}
			</form>
		</div>

		{#if importModalOpen}
			<div
				class="modal-backdrop"
				role="presentation"
				onclick={(e) => e.target === e.currentTarget && (importModalOpen = false)}
			>
				<div
					class="modal"
					role="dialog"
					aria-modal="true"
					aria-labelledby="import-dialog-title"
				>
					<div class="modal-header">
						<h3 id="import-dialog-title" class="modal-title">Import list</h3>
						<button
							type="button"
							class="modal-close"
							aria-label="Close"
							onclick={() => (importModalOpen = false)}
						>
							<X size={20} aria-hidden="true" />
						</button>
					</div>
					<form
						method="post"
						action="?/importMovies"
						enctype="multipart/form-data"
						use:enhance={({ formElement }) => {
							return async ({ result, update }) => {
								await update();
								if (result.type === 'success' && result.data?.importSuccess) {
									formElement.reset();
									importModalOpen = false;
								}
							};
						}}
						class="form"
					>
						<label for="import-file" class="label">CSV file</label>
						<input
							id="import-file"
							type="file"
							name="file"
							accept=".csv"
							class="input"
						/>
						<button type="submit" class="btn btn--primary btn--icon">
							<Plus size={18} aria-hidden="true" />
							Import
						</button>
						{#if form?.importSuccess && form?.importCount != null}
							<p role="status" aria-live="polite" class="success">Added {form.importCount} movie{form.importCount === 1 ? '' : 's'}.</p>
						{:else if form?.importError}
							<p role="alert" aria-live="polite" class="error">{form.importError}</p>
						{/if}
					</form>
				</div>
			</div>
		{/if}
	</section>

	<section class="section" aria-labelledby="list-heading">
		<div class="section-header">
			<h2 id="list-heading" class="section-title">Your list</h2>
			<label class="filter-control">
				<input type="checkbox" bind:checked={filterWatchlistByFavorites} class="filter-checkbox" />
				<span class="filter-label">Favorites only</span>
			</label>
		</div>
		{#if watchlistFiltered.length === 0}
			<p class="empty">
				{filterWatchlistByFavorites ? 'No favorites in your list.' : 'No movies yet. Add one above.'}
			</p>
		{:else}
			<ul class="list">
				{#each watchlistFiltered as m (m.id)}
					<li class="list-item">
						<form method="post" action="?/toggleFavorite" use:enhance class="list-item-form list-item-star">
							<input type="hidden" name="id" value={m.id} />
							<button type="submit" class="btn btn--icon btn--star" aria-label={m.favorite ? 'Remove from favorites' : 'Add to favorites'} title={m.favorite ? 'Remove from favorites' : 'Add to favorites'}>
								<Star size={18} class={m.favorite ? 'filled' : ''} />
							</button>
						</form>
						<span class="list-item-title">{m.title}</span>
						<div class="list-item-actions">
							<form method="post" action="?/markWatched" use:enhance class="list-item-form">
								<input type="hidden" name="id" value={m.id} />
								<button type="submit" class="btn btn--secondary btn--small btn--icon">
									<Check size={16} aria-hidden="true" />
									Mark as watched
								</button>
							</form>
							<form method="post" action="?/deleteMovie" use:enhance class="list-item-form">
								<input type="hidden" name="id" value={m.id} />
								<button type="submit" class="btn btn--secondary btn--small btn--icon">
									<Trash2 size={16} aria-hidden="true" />
									Remove
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="section" aria-labelledby="watched-heading">
		<div class="section-header">
			<h2 id="watched-heading" class="section-title">Watched</h2>
			<label class="filter-control">
				<input type="checkbox" bind:checked={filterWatchedByFavorites} class="filter-checkbox" />
				<span class="filter-label">Favorites only</span>
			</label>
		</div>
		{#if watchedFiltered.length === 0}
			<p class="empty">
				{filterWatchedByFavorites ? 'No favorites in watched.' : 'No watched movies yet.'}
			</p>
		{:else}
			<ul class="list">
				{#each watchedFiltered as m (m.id)}
					<li class="list-item">
						<form method="post" action="?/toggleFavorite" use:enhance class="list-item-form list-item-star">
							<input type="hidden" name="id" value={m.id} />
							<button type="submit" class="btn btn--icon btn--star" aria-label={m.favorite ? 'Remove from favorites' : 'Add to favorites'} title={m.favorite ? 'Remove from favorites' : 'Add to favorites'}>
								<Star size={18} class={m.favorite ? 'filled' : ''} />
							</button>
						</form>
						<span class="list-item-title">{m.title}</span>
						<div class="list-item-actions">
							<form method="post" action="?/markUnwatched" use:enhance class="list-item-form">
								<input type="hidden" name="id" value={m.id} />
								<button type="submit" class="btn btn--secondary btn--small btn--icon">
									<RotateCcw size={16} aria-hidden="true" />
									Mark as unwatched
								</button>
							</form>
							<form method="post" action="?/deleteMovie" use:enhance class="list-item-form">
								<input type="hidden" name="id" value={m.id} />
								<button type="submit" class="btn btn--secondary btn--small btn--icon">
									<Trash2 size={16} aria-hidden="true" />
									Remove
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>

<style>
	.page {
		max-width: 36rem;
		margin: 0 auto;
		padding: var(--space-7) var(--space-5);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
		padding-bottom: var(--space-6);
		border-bottom: var(--border-width-thin) solid var(--color-border);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.signed-in {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.signed-in strong {
		font-weight: 600;
		color: var(--color-text-strong);
	}

	.title {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.btn--icon {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.section {
		margin-bottom: var(--space-8);
	}

	.section:last-child {
		margin-bottom: 0;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
		flex-wrap: wrap;
	}

	.section-title {
		margin: 0;
		font-size: var(--font-size-md);
		font-weight: 600;
		color: var(--color-text-strong);
	}

	.filter-control {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		user-select: none;
	}

	.filter-control:hover {
		color: var(--color-text);
	}

	.filter-checkbox {
		width: 1rem;
		height: 1rem;
		accent-color: var(--color-btn-primary-bg, currentColor);
		cursor: pointer;
	}

	.filter-label {
		white-space: nowrap;
	}

	.form {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: var(--space-3) var(--space-4);
	}

	.label {
		display: block;
		width: 100%;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-strong);
	}

	.input {
		flex: 1;
		min-width: 12rem;
		height: 2.5rem;
		padding: var(--space-2) var(--space-3);
		font: inherit;
		font-size: var(--font-size-base);
		border: var(--border-width-thin) solid var(--color-border-input);
		border-radius: var(--radius-md);
		background: var(--color-input-bg);
	}

	.btn {
		height: 2.5rem;
		padding: var(--space-2) var(--space-4);
		font: inherit;
		font-size: var(--font-size-ui);
		font-weight: 500;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
	}

	.btn--primary {
		background: var(--color-btn-primary-bg);
		color: var(--color-btn-primary-text);
	}

	.btn--primary:hover {
		background: var(--color-btn-primary-hover);
	}

	.btn--secondary {
		background: var(--color-btn-secondary-bg);
		color: var(--color-text);
	}

	.btn--secondary:hover {
		background: var(--color-btn-secondary-hover);
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

	.add-row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: var(--space-3);
	}

	.form--inline {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: var(--space-3);
	}

	.form--inline .label {
		margin-bottom: 0;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	.modal {
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		padding: var(--space-6);
		max-width: 24rem;
		width: 100%;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-4);
	}

	.modal-title {
		margin: 0;
		font-size: var(--font-size-md);
		font-weight: 600;
	}

	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-1);
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
	}

	.modal-close:hover {
		background: var(--color-border);
		color: var(--color-text);
	}

	.empty {
		margin: 0;
		color: var(--color-text-muted);
		font-size: var(--font-size-ui);
	}

	.list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.list-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3);
		margin-bottom: var(--space-1);
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-ui);
	}

	.list-item-title {
		flex: 1;
		min-width: 0;
	}

	.list-item-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.list-item-form {
		display: inline;
		margin: 0;
	}

	.btn--small {
		height: 2rem;
		padding: var(--space-1) var(--space-2);
		font-size: var(--font-size-xs);
	}

	.list-item:last-child {
		margin-bottom: 0;
	}

	.list-item-star {
		flex-shrink: 0;
	}

	.btn--star {
		padding: var(--space-1);
		background: transparent;
		color: var(--color-accent);
	}

	.btn--star:hover {
		color: var(--color-accent-hover);
	}

	.btn--star :global(svg) {
		stroke: currentColor;
		fill: none;
	}

	.btn--star :global(svg.filled) {
		fill: currentColor;
	}
</style>
