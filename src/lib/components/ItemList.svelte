<script lang="ts">
	import EmptyState from './EmptyState.svelte';
	import type { Snippet } from 'svelte';
	import type { ListEntry } from '$lib/types';

	interface Props {
		title: string;
		titleId: string;
		items: ListEntry[];
		filterLabel?: string;
		filterChecked?: boolean;
		emptyMessage: string;
		emptyMessageFiltered?: string;
		emptyIcon?: Snippet;
		children: Snippet<[ListEntry]>;
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
		children
	}: Props = $props();

	const isEmpty = $derived(items.length === 0);
	const displayMessage = $derived(filterChecked ? (emptyMessageFiltered ?? emptyMessage) : emptyMessage);
	const showFilter = $derived(filterLabel != null && filterLabel !== '');
</script>

<section class="list-section" aria-labelledby={titleId}>
	<div class="section-header">
		<h2 id={titleId} class="section-title">{title}</h2>
		{#if showFilter}
			<label class="filter-control">
				<input type="checkbox" bind:checked={filterChecked} class="filter-checkbox" />
				<span class="filter-label">{filterLabel}</span>
			</label>
		{/if}
	</div>
	{#if isEmpty}
		<EmptyState message={displayMessage} icon={emptyIcon} />
	{:else}
		<ul class="list">
			{#each items as item (item.id)}
				{@render children(item)}
			{/each}
		</ul>
	{/if}
</section>

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

	.list {
		margin: 0;
		padding: 0;
		list-style: none;
		width: fit-content;
		max-width: min(100%, 44rem);
	}

	.list > li {
		width: 100%;
	}

	.list > li:first-child {
		width: fit-content;
	}

	.list > li:first-child :global(.ticket) {
		width: fit-content;
		flex: 0 0 auto;
	}
</style>
