<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		titleId: string;
		headerAction?: Snippet;
		children?: Snippet;
	}

	let { title, titleId, headerAction, children }: Props = $props();
</script>

<section class="section" aria-labelledby={titleId}>
	<div class="section-header">
		<h2 id={titleId} class="section-title">{title}</h2>
		{#if headerAction}
			{@render headerAction()}
		{/if}
	</div>
	{#if children}
		{@render children()}
	{/if}
</section>

<style>
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
</style>
