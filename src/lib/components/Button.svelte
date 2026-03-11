<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'ghost' | 'secondary' | 'star';
		size?: 'normal' | 'small';
		type?: 'button' | 'submit';
		disabled?: boolean;
		ariaLabel?: string;
		ariaHaspopup?: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
		ariaExpanded?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'normal',
		type = 'button',
		disabled = false,
		ariaLabel,
		ariaHaspopup,
		ariaExpanded,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const variantClass = $derived(variant === 'star' ? 'btn--star' : `btn--${variant}`);
	const sizeClass = $derived(size === 'small' ? 'btn--small' : '');
	const iconClass = 'btn--icon';
</script>

<button
	{type}
	{disabled}
	aria-label={ariaLabel}
	aria-haspopup={ariaHaspopup}
	aria-expanded={ariaExpanded}
	class="btn {variantClass} {sizeClass} {iconClass} {className}"
	onclick={onclick}
>
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	.btn {
		height: 2.5rem;
		padding: var(--space-6);
		font: inherit;
		font-size: var(--font-size-ui);
		font-weight: 500;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		background: transparent;
	}

	.btn--icon {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
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

	.btn--ghost {
		background: transparent;
		color: var(--color-text);
	}

	.btn--ghost:hover {
		background: var(--color-border);
	}

	.btn--ghost.btn--action {
		color: var(--color-text);
	}

	.btn--ghost.btn--action:hover {
		color: var(--color-text-strong);
	}

	.btn--small {
		height: 2rem;
		padding: var(--space-6);
		font-size: var(--font-size-xs);
	}

	.btn-label {
		white-space: nowrap;
	}

	.btn--star {
		padding: var(--space-1);
		min-width: 2.5rem;
		min-height: 2.5rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--color-accent);
	}

	.btn--star:hover {
		color: var(--color-accent-hover);
		background: var(--color-accent-hover-muted);
	}

	.btn--star :global(svg) {
		stroke: currentColor;
		fill: none;
	}

	.btn--star :global(svg.filled) {
		fill: currentColor;
	}
</style>
