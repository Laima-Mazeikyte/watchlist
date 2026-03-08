<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from './Button.svelte';
	import type { ListEntry, ListItemAction, FavoriteAction } from '$lib/types';

	interface Props {
		item: ListEntry;
		favoriteAction?: FavoriteAction | null;
		actions: ListItemAction[];
		onFavoriteToggle?: (id: number | string, newFavorite: boolean) => void;
		onFavoriteToggleRevert?: (id: number | string) => void;
	}

	let { item, favoriteAction, actions, onFavoriteToggle, onFavoriteToggleRevert }: Props = $props();
</script>

<li class="list-item">
	{#if favoriteAction}
		<form
			method="post"
			action={favoriteAction.formAction}
			use:enhance={({ submitter }) => {
				const scrollY = window.scrollY;
				const focusTarget = submitter ?? undefined;
				onFavoriteToggle?.(item.id, !item.favorite);
				return async ({ update }) => {
					await update();
					onFavoriteToggleRevert?.(item.id);
					requestAnimationFrame(() => {
						window.scrollTo(0, scrollY);
						if (focusTarget?.isConnected && typeof focusTarget.focus === 'function') {
							focusTarget.focus({ preventScroll: true });
						}
					});
				};
			}}
			class="list-item-form list-item-star"
			data-sveltekit-noscroll
		>
			{#each favoriteAction.hiddenFields as field}
				<input type="hidden" name={field.name} value={field.value} />
			{/each}
			<Button
				variant="star"
				type="submit"
				ariaLabel={favoriteAction.ariaLabel}
			>
				{#snippet children()}
					{@const Icon = favoriteAction.icon}
					<Icon
						size={18}
						class={item.favorite ? 'filled' : ''}
						aria-hidden="true"
					/>
				{/snippet}
			</Button>
		</form>
	{/if}
	<span class="list-item-title">{item.title}</span>
	<div class="list-item-actions">
		{#each actions as action}
			<form
				method="post"
				action={action.formAction}
				use:enhance={({ submitter }) => {
					const scrollY = window.scrollY;
					const focusTarget = submitter ?? undefined;
					return async ({ update }) => {
						await update();
						requestAnimationFrame(() => {
							window.scrollTo(0, scrollY);
							if (focusTarget?.isConnected && typeof focusTarget.focus === 'function') {
								focusTarget.focus({ preventScroll: true });
							}
						});
					};
				}}
				class="list-item-form"
				data-sveltekit-noscroll
			>
				{#each action.hiddenFields as field}
					<input type="hidden" name={field.name} value={field.value} />
				{/each}
				<Button
					variant="ghost"
					size="small"
					type="submit"
					ariaLabel={action.ariaLabel ?? action.label}
					class={action.iconOnly ? '' : 'btn--action'}
				>
					{#snippet children()}
						{@const ActionIcon = action.icon}
						<ActionIcon size={16} aria-hidden="true" />
						{#if !action.iconOnly}
							<span class="btn-label">{action.label}</span>
						{/if}
					{/snippet}
				</Button>
			</form>
		{/each}
	</div>
</li>

<style>
	.list-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3);
		margin-bottom: var(--space-1);
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-ui);
	}

	.list-item:hover {
		background: var(--color-bg);
	}

	.list-item:last-child {
		margin-bottom: 0;
	}

	.list-item-title {
		flex: 1;
		min-width: 0;
	}

	.list-item-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.list-item-form {
		display: inline;
		margin: 0;
	}

	.list-item-star {
		flex-shrink: 0;
	}
</style>
