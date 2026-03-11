<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		search?: Snippet;
		user: Snippet;
	}

	let { search, user }: Props = $props();
</script>

<header class="toolbar">
	<div class="toolbar-inner">
		<div class="toolbar-spacer"></div>
		{#if search}
			<div class="toolbar-search">
				{@render search()}
			</div>
		{/if}
		<div class="toolbar-user">
			{@render user()}
		</div>
	</div>
</header>

<style>
	.toolbar {
		width: 100%;
		background: transparent;
	}

	.toolbar-inner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-5);
		width: 100%;
		padding: var(--space-4) var(--space-5);
	}

	.toolbar-spacer {
		flex: 1;
	}

	.toolbar-search {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		width: 100%;
		max-width: 520px;
	}

	.toolbar-user {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-3);
		flex: 1;
	}

	.toolbar-user :global(.signed-in) {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.toolbar-user :global(.signed-in strong) {
		font-weight: 600;
		color: var(--color-text-strong);
	}

	@media (max-width: 768px) {
		.toolbar-inner {
			flex-wrap: wrap;
			gap: var(--space-4);
			padding: var(--space-4);
		}

		.toolbar-spacer {
			display: none;
		}

		.toolbar-search {
			order: 2;
			flex-basis: 100%;
			max-width: none;
		}

		.toolbar-user {
			order: 1;
			flex: 0;
			margin-left: auto;
		}
	}
</style>
