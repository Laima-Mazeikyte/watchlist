<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		title: string;
		titleId: string;
		children?: Snippet;
	}

	let { open, onClose, title, titleId, children }: Props = $props();

	$effect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	});
</script>

{#if open}
	<div
		class="modal-backdrop"
		role="presentation"
		onclick={(e) => e.target === e.currentTarget && onClose()}
	>
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
		>
			<div class="modal-header">
				<h3 id={titleId} class="modal-title">{title}</h3>
				<button
					type="button"
					class="modal-close"
					aria-label="Close"
					onclick={onClose}
				>
					<X size={20} aria-hidden="true" />
				</button>
			</div>
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	.modal {
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		padding: var(--space-6);
		max-width: 24rem;
		width: 100%;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-4);
	}

	.modal-title {
		margin: 0;
		font-size: var(--font-size-md);
		font-weight: 600;
	}

	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-1);
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
	}

	.modal-close:hover {
		background: var(--color-border);
		color: var(--color-text);
	}
</style>
