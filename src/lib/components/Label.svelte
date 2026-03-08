<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		for: string;
		visuallyHidden?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { for: forId, visuallyHidden = false, class: className = '', children }: Props = $props();
</script>

<label for={forId} class="label {visuallyHidden ? 'visually-hidden' : ''} {className}">
	{#if children}
		{@render children()}
	{/if}
</label>

<style>
	.label {
		display: block;
		width: 100%;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-strong);
	}

	/* visually-hidden uses global class from app.css */
</style>
