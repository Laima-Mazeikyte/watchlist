<script lang="ts">
	import '../app.css';
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

	:global(body) {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--font-size-base);
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
