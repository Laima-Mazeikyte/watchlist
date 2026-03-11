<script lang="ts">
	import { enhance } from '$app/forms';
	import { Film, LogOut, Plus, CheckCircle, RotateCcw, Trash2 } from 'lucide-svelte';
	import {
		Button,
		Input,
		ItemList,
		Label,
		ListItem,
		Modal,
		SearchDropdown,
		Toolbar
	} from '$lib/components';
	import type { ListEntry, ListItemAction } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let importModalOpen = $state(false);
	let importSubmitting = $state(false);

	// Track movies marked as watched in this session to keep them visible until page refresh
	let recentlyWatchedIds = $state(new Set<number | string>());

	const movies = $derived(
		(data.movies as ListEntry[]).map((m) => {
			// If this movie was just marked as watched in this session,
			// show it as watched but keep its original "unwatched" status for filtering
			if (recentlyWatchedIds.has(m.id)) {
				return { ...m, watched: true, _keepInUnwatched: true };
			}
			return m;
		})
	);

	function handleStubTear(id: number | string) {
		recentlyWatchedIds.add(id);
		recentlyWatchedIds = new Set(recentlyWatchedIds);
	}

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
		{#snippet search()}
			<div class="search-container">
				<SearchDropdown tmdbConfigured={data.tmdbConfigured} />
				<button
					type="button"
					class="btn-import"
					aria-haspopup="dialog"
					aria-expanded={importModalOpen}
					onclick={() => (importModalOpen = true)}
				>
					Import watchlist
				</button>
			</div>
		{/snippet}
		{#snippet user()}
			<form method="post" action="?/signOut" use:enhance>
				<Button variant="minimal" size="small" type="submit" ariaLabel="Logout">
					{#snippet children()}
						<LogOut size={16} aria-hidden="true" />
					{/snippet}
				</Button>
			</form>
		{/snippet}
	</Toolbar>

	<div class="page">
		<ItemList
			items={movies}
			emptyMessage="No movies yet. Search above to add one."
			emptyIcon={emptyListIcon}
			showWatchedFilter={true}
		>
		{#snippet children(item)}
			<ListItem
				item={item}
				actions={getItemActions(item)}
				mainActionLabel={item.watched ? 'UNWATCHED' : 'WATCHED IT!'}
				scrapAction={getScrapAction(item)}
				onStubTear={handleStubTear}
			/>
		{/snippet}
		</ItemList>
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
				class="form--import"
			>
				<p class="form--import-description">
					Upload a CSV file with a Title column to bulk import movies.
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
					<p role="status" aria-live="polite" class="success">
						Added {form.importCount} movie{form.importCount === 1 ? '' : 's'}.
					</p>
				{:else if form?.importError}
					<p role="alert" aria-live="polite" class="error">{form.importError}</p>
				{/if}
				<div class="form--import-actions">
					<Button variant="primary" type="submit" disabled={importSubmitting}>
						{#snippet children()}
							<Plus size={18} aria-hidden="true" />
							{importSubmitting ? 'Importing...' : 'Import'}
						{/snippet}
					</Button>
				</div>
			</form>
		{/snippet}
	</Modal>
</main>

<style>
	.app {
		min-height: 100%;
	}

	.page {
		width: 100%;
		margin: 0 auto;
		padding: var(--space-4) var(--space-5);
	}

	.search-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		width: 100%;
	}

	.btn-import {
		background: none;
		border: none;
		padding: var(--space-1) var(--space-2);
		font-family: inherit;
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		white-space: nowrap;
		transition: color 0.15s ease;
	}

	.btn-import:hover {
		color: var(--color-text);
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
