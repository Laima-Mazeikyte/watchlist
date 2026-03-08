<script lang="ts">
	interface Props {
		id: string;
		name: string;
		type?: 'text' | 'file';
		accept?: string;
		required?: boolean;
		disabled?: boolean;
		autocomplete?: string;
		class?: string;
	}

	let {
		id,
		name,
		type = 'text',
		accept,
		required = false,
		disabled = false,
		autocomplete = 'off',
		class: className = ''
	}: Props = $props();
</script>

<input
	{id}
	{name}
	{type}
	{accept}
	{required}
	{disabled}
	autocomplete={autocomplete as HTMLInputElement['autocomplete']}
	class="input {className}"
/>

<style>
	.input {
		flex: 1;
		min-width: 12rem;
		height: 2.5rem;
		padding: var(--space-2) var(--space-3);
		font: inherit;
		font-size: var(--font-size-base);
		border: var(--border-width-thin) solid var(--color-border-input);
		border-radius: var(--radius-md);
		background: var(--color-input-bg);
	}

	.input--full {
		flex: 1;
		min-width: 0;
	}

	.input--file {
		width: 100%;
		max-width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}
</style>
