<script lang="ts">
	import EmptyState from './EmptyState.svelte';
	import RandomPickerModal from './RandomPickerModal.svelte';
	import type { Snippet } from 'svelte';
	import type { ListEntry } from '$lib/types';

	type FilterValue = 'all' | 'unwatched' | 'watched';

	interface Props {
		title?: string;
		titleId?: string;
		items: ListEntry[];
		filterLabel?: string;
		filterChecked?: boolean;
		emptyMessage: string;
		emptyMessageFiltered?: string;
		emptyIcon?: Snippet;
		headerAction?: Snippet;
		children: Snippet<[ListEntry]>;
		showWatchedFilter?: boolean;
	}

	let {
		title,
		titleId,
		items,
		filterLabel,
		filterChecked = $bindable(false),
		emptyMessage,
		emptyMessageFiltered,
		emptyIcon,
		headerAction,
		children,
		showWatchedFilter = false
	}: Props = $props();

	let activeFilter = $state<FilterValue>('unwatched');

	const filteredItems = $derived.by(() => {
		if (!showWatchedFilter || activeFilter === 'all') return items;
		if (activeFilter === 'watched') return items.filter((item) => item.watched);
		// For unwatched filter, also include items with _keepInUnwatched flag
		// (movies marked as watched this session that should stay visible until refresh)
		return items.filter((item) => !item.watched || (item as any)._keepInUnwatched);
	});

	const isEmpty = $derived(filteredItems.length === 0);
	const hasAnyItems = $derived(items.length > 0);
	const displayMessage = $derived(
		activeFilter !== 'all'
			? `No ${activeFilter} movies`
			: filterChecked
				? (emptyMessageFiltered ?? emptyMessage)
				: emptyMessage
	);
	const showFilter = $derived(filterLabel != null && filterLabel !== '');

	const watchedCount = $derived(items.filter((item) => item.watched).length);
	const unwatchedCount = $derived(items.filter((item) => !item.watched).length);

	let showRandomPicker = $state(false);
	const canShowRandomPicker = $derived(
		showWatchedFilter && activeFilter === 'unwatched' && filteredItems.length >= 2
	);
</script>

<section class="list-section" aria-labelledby={titleId}>
	{#if title || showFilter || showWatchedFilter || headerAction}
		<div class="section-header">
			{#if title}
				<h2 id={titleId} class="section-title">{title}</h2>
			{/if}
			{#if showWatchedFilter && hasAnyItems}
				<div class="filter-tabs" role="tablist" aria-label="Filter movies">
					<button
						type="button"
						role="tab"
						class="filter-tab"
						class:active={activeFilter === 'all'}
						aria-selected={activeFilter === 'all'}
						onclick={() => (activeFilter = 'all')}
					>
						All <span class="filter-count">{items.length}</span>
					</button>
					<button
						type="button"
						role="tab"
						class="filter-tab"
						class:active={activeFilter === 'unwatched'}
						aria-selected={activeFilter === 'unwatched'}
						onclick={() => (activeFilter = 'unwatched')}
					>
						To watch <span class="filter-count">{unwatchedCount}</span>
					</button>
					<button
						type="button"
						role="tab"
						class="filter-tab"
						class:active={activeFilter === 'watched'}
						aria-selected={activeFilter === 'watched'}
						onclick={() => (activeFilter = 'watched')}
					>
						Watched <span class="filter-count">{watchedCount}</span>
					</button>
				</div>
			{/if}
			<div class="section-header-actions">
				{#if showFilter}
					<label class="filter-control">
						<input type="checkbox" bind:checked={filterChecked} class="filter-checkbox" />
						<span class="filter-label">{filterLabel}</span>
					</label>
				{/if}
				{#if headerAction}
					{@render headerAction()}
				{/if}
			</div>
		</div>
	{/if}
	{#if isEmpty}
		<EmptyState message={displayMessage} icon={emptyIcon} />
	{:else}
		<ul class="list">
			{#each filteredItems as item (item.id)}
				{@render children(item)}
			{/each}
		</ul>
	{/if}
</section>

{#if canShowRandomPicker}
	<button
		type="button"
		class="random-picker-fab"
		aria-label="Pick a random movie"
		onclick={() => (showRandomPicker = true)}
	>
		Pick random
	</button>
{/if}

<RandomPickerModal
	open={showRandomPicker}
	items={filteredItems}
	onClose={() => (showRandomPicker = false)}
/>

<style>
	.list-section {
		margin-bottom: var(--space-8);
	}

	.list-section:last-child {
		margin-bottom: 0;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
		flex-wrap: wrap;
	}

	.section-title {
		margin: 0;
		font-size: var(--font-size-md);
		font-weight: 600;
		color: var(--color-text-strong);
	}

	.section-header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.filter-tabs {
		display: flex;
		gap: var(--space-4);
	}

	.filter-tab {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) 0;
		font: inherit;
		font-size: var(--font-size-sm);
		font-weight: 400;
		color: var(--color-text-muted);
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s;
	}

	.filter-tab:hover {
		color: var(--color-text);
	}

	.filter-tab.active {
		color: var(--color-text-strong);
		border-bottom-color: var(--color-text-strong);
	}

	.filter-count {
		font-size: var(--font-size-xs);
		color: inherit;
		opacity: 0.6;
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

	.list {
		margin: 0;
		padding: 0;
		list-style: none;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		gap: var(--space-2);
		justify-items: center;
	}

	@media (max-width: 440px) {
		.list {
			grid-template-columns: 1fr;
			justify-items: start;
			overflow-x: auto;
		}
	}

	.random-picker-fab {
		position: fixed;
		bottom: var(--space-6);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-3) var(--space-6);
		font: inherit;
		font-size: var(--font-size-base);
		background: var(--gray-950);
		color: var(--gray-300);
		border: none;
		border-radius: 9999px;
		cursor: pointer;
		transition: background 0.15s ease;
		z-index: 100;
	}

	.random-picker-fab:hover {
		background: var(--gray-900);
	}

	@media (max-width: 440px) {
		.random-picker-fab {
			bottom: var(--space-4);
		}
	}
</style>
