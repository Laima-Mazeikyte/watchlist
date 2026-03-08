<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		message: string;
		icon?: Snippet;
	}

	let { message, icon }: Props = $props();
</script>

<p class="empty">
	{#if icon}
		<span class="empty-icon" aria-hidden="true">{@render icon()}</span>
	{/if}
	{message}
</p>

<style>
	.empty {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		color: var(--color-text-muted);
		font-size: var(--font-size-ui);
	}

	.empty-icon {
		flex-shrink: 0;
		color: var(--color-text-muted);
		opacity: 0.8;
	}
</style>
