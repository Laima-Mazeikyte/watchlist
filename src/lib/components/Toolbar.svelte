<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: Snippet;
		user: Snippet;
	}

	let { title, user }: Props = $props();
</script>

<header class="toolbar">
	<div class="toolbar-inner">
		<h1 class="title">
			{@render title()}
		</h1>
		<div class="toolbar-user">
			{@render user()}
		</div>
	</div>
</header>

<style>
	.toolbar {
		width: 100%;
		background: var(--color-surface);
		border-bottom: var(--border-width-thin) solid var(--color-border);
	}

	.toolbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		max-width: 36rem;
		margin: 0 auto;
		padding: var(--space-4) var(--space-5);
		flex-wrap: wrap;
	}

	.toolbar-user {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-left: auto;
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

	.toolbar-user :global(.signed-in) {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.toolbar-user :global(.signed-in strong) {
		font-weight: 600;
		color: var(--color-text-strong);
	}
</style>
