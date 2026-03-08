<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(:root) {
		--color-bg: #fafafa;
		--color-surface: #fff;
		--color-text: #1a1a1a;
		--color-text-muted: #666;
		--color-text-strong: #444;
		--color-border: #e5e5e5;
		--color-border-input: #ccc;
		--color-input-bg: #fff;
		--color-btn-primary-bg: #1a1a1a;
		--color-btn-primary-text: #fff;
		--color-btn-primary-hover: #333;
		--color-btn-secondary-bg: #e5e5e5;
		--color-btn-secondary-hover: #d4d4d4;
		--color-error: #b91c1c;
		--focus-ring: 2px solid #2563eb;
		--focus-ring-offset: 2px;
		color-scheme: light;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--color-bg: #0f0f0f;
			--color-surface: #1a1a1a;
			--color-text: #fafafa;
			--color-text-muted: #a3a3a3;
			--color-text-strong: #d4d4d4;
			--color-border: #2a2a2a;
			--color-border-input: #404040;
			--color-input-bg: #1a1a1a;
			--color-btn-primary-bg: #fafafa;
			--color-btn-primary-text: #0f0f0f;
			--color-btn-primary-hover: #e5e5e5;
			--color-btn-secondary-bg: #2a2a2a;
			--color-btn-secondary-hover: #404040;
			--color-error: #f87171;
			--focus-ring: 2px solid #60a5fa;
			color-scheme: dark;
		}
	}

	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		font-size: 1rem;
		line-height: 1.5;
		color: var(--color-text);
		background-color: var(--color-bg);
		-webkit-font-smoothing: antialiased;
	}

	:global(*:focus-visible) {
		outline: var(--focus-ring);
		outline-offset: var(--focus-ring-offset);
	}
</style>
