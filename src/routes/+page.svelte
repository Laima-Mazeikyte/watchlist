<script lang="ts">
	import { enhance } from '$app/forms';
	import { Film, LogOut, Plus, CheckCircle, RotateCcw, Trash2, Star, Upload } from 'lucide-svelte';
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
	import type { ListEntry, ListItemAction, FavoriteAction } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let filterWatchlistByFavorites = $state(false);
	let filterWatchedByFavorites = $state(false);
	let importModalOpen = $state(false);
	let addSubmitting = $state(false);
	let importSubmitting = $state(false);
	let optimisticFavorites = $state<Record<string, boolean>>({});

	// Full lists with optimistic favorite merged (for instant star feedback)
	const watchlistWithOptimistic = $derived(
		(data.watchlist as ListEntry[]).map((m) => ({
			...m,
			favorite: optimisticFavorites[String(m.id)] ?? m.favorite
		}))
	);
	const watchedWithOptimistic = $derived(
		(data.watched as ListEntry[]).map((m) => ({
			...m,
			favorite: optimisticFavorites[String(m.id)] ?? m.favorite
		}))
	);

	// Apply "favorites only" filter for display
	const watchlistDisplay = $derived(
		filterWatchlistByFavorites ? watchlistWithOptimistic.filter((m) => m.favorite) : watchlistWithOptimistic
	);
	const watchedDisplay = $derived(
		filterWatchedByFavorites ? watchedWithOptimistic.filter((m) => m.favorite) : watchedWithOptimistic
	);

	function setOptimisticFavorite(id: number | string, value: boolean) {
		optimisticFavorites = { ...optimisticFavorites, [String(id)]: value };
	}
	function clearOptimisticFavorite(id: number | string) {
		const key = String(id);
		const { [key]: _, ...rest } = optimisticFavorites;
		optimisticFavorites = rest;
	}

	// Generic action config: favorite toggle (same for both lists)
	const favoriteActionBase: Omit<FavoriteAction, 'hiddenFields' | 'ariaLabel'> & { ariaLabel: string } = {
		formAction: '?/toggleFavorite',
		method: 'post',
		ariaLabel: '',
		icon: Star
	};
	function getFavoriteAction(item: ListEntry): FavoriteAction {
		return {
			...favoriteActionBase,
			ariaLabel: item.favorite ? 'Remove from favorites' : 'Add to favorites',
			hiddenFields: [{ name: 'id', value: item.id }]
		};
	}

	// Watchlist row actions: mark watched, delete
	function getWatchlistActions(item: ListEntry): ListItemAction[] {
		return [
			{
				formAction: '?/markWatched',
				method: 'post',
				hiddenFields: [{ name: 'id', value: item.id }],
				label: 'Mark as watched',
				ariaLabel: 'Mark as watched',
				icon: CheckCircle
			},
			{
				formAction: '?/deleteMovie',
				method: 'post',
				hiddenFields: [{ name: 'id', value: item.id }],
				label: 'Remove',
				ariaLabel: 'Remove',
				icon: Trash2,
				iconOnly: true
			}
		];
	}

	// Watched row actions: mark unwatched, delete
	function getWatchedActions(item: ListEntry): ListItemAction[] {
		return [
			{
				formAction: '?/markUnwatched',
				method: 'post',
				hiddenFields: [{ name: 'id', value: item.id }],
				label: 'Mark as unwatched',
				ariaLabel: 'Mark as unwatched',
				icon: RotateCcw
			},
			{
				formAction: '?/deleteMovie',
				method: 'post',
				hiddenFields: [{ name: 'id', value: item.id }],
				label: 'Remove',
				ariaLabel: 'Remove',
				icon: Trash2,
				iconOnly: true
			}
		];
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
						<Upload size={16} aria-hidden="true" />
						<span class="btn-label">Import movies</span>
					{/snippet}
				</Button>
			{/snippet}
			{#snippet children()}
				<div class="add-row">
					<form
						method="post"
						action="?/addMovie"
						use:enhance={({ formElement }) => {
							return async ({ result, update }) => {
								addSubmitting = true;
								try {
									await update();
									if (result.type === 'redirect') formElement.reset();
								} finally {
									addSubmitting = false;
								}
							};
						}}
						class="form form--add"
					>
						<Label for="title" visuallyHidden>Title</Label>
						<Input id="title" name="title" required disabled={addSubmitting} class="input--full" />
						<Button variant="primary" type="submit" disabled={addSubmitting}>
							{#snippet children()}
								<Plus size={18} aria-hidden="true" />
								{addSubmitting ? 'Adding…' : 'Add movie'}
							{/snippet}
						</Button>
						{#if form?.message}
							<p role="alert" aria-live="polite" class="error">{form.message}</p>
						{/if}
					</form>
				</div>

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
			items={watchlistDisplay}
			bind:filterChecked={filterWatchlistByFavorites}
			filterLabel="Favorites only"
			emptyMessage="No movies yet. Add one above."
			emptyMessageFiltered="No favorites in your list."
			emptyIcon={emptyListIcon}
		>
			{#snippet children(item)}
				<ListItem
					item={item}
					favoriteAction={getFavoriteAction(item)}
					actions={getWatchlistActions(item)}
					onFavoriteToggle={setOptimisticFavorite}
					onFavoriteToggleRevert={clearOptimisticFavorite}
				/>
			{/snippet}
		</ItemList>

		<ItemList
			title="Watched"
			titleId="watched-heading"
			items={watchedDisplay}
			bind:filterChecked={filterWatchedByFavorites}
			filterLabel="Favorites only"
			emptyMessage="No watched movies yet."
			emptyMessageFiltered="No favorites in watched."
			emptyIcon={emptyListIcon}
		>
			{#snippet children(item)}
				<ListItem
					item={item}
					favoriteAction={getFavoriteAction(item)}
					actions={getWatchedActions(item)}
					onFavoriteToggle={setOptimisticFavorite}
					onFavoriteToggleRevert={clearOptimisticFavorite}
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

	.form--add :global(.label) {
		margin-bottom: 0;
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
</style>
