<script lang="ts">
	import { enhance } from '$app/forms';
	import { Film, X } from 'lucide-svelte';
	import Button from './Button.svelte';
	import type { ListEntry, ListItemAction, FavoriteAction } from '$lib/types';

	const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p';

	const CARD_COLORS = [
		{ bg: '#59A4BB', stub: '#4a8fa3', text: '#1a3d47', textMuted: '#2d5a68' },
		{ bg: '#66CEDF', stub: '#52b5c5', text: '#1a4650', textMuted: '#2d6a78' },
		{ bg: '#6CD78F', stub: '#5ac47d', text: '#1a4028', textMuted: '#2d5f3d' },
		{ bg: '#AD6E39', stub: '#9a5f2e', text: '#2e1d0f', textMuted: '#4a3520' },
		{ bg: '#B44E40', stub: '#9f4338', text: '#2e1512', textMuted: '#4a2520' },
		{ bg: '#C48CA5', stub: '#b37a94', text: '#3d2532', textMuted: '#5c3a4a' },
		{ bg: '#C6BA88', stub: '#b8ab79', text: '#3d3a2e', textMuted: '#5c5746' },
		{ bg: '#D5C25D', stub: '#c4b24e', text: '#3d3818', textMuted: '#5c5428' }
	];

	function hashString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return hash;
	}

	function getCardColor(id: number | string): (typeof CARD_COLORS)[0] {
		const hash = typeof id === 'number' ? id : hashString(String(id));
		return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
	}

	interface Props {
		item: ListEntry;
		favoriteAction?: FavoriteAction | null;
		actions: ListItemAction[];
		mainActionLabel?: string | null;
		scrapAction?: ListItemAction | null;
		onFavoriteToggle?: (id: number | string, newFavorite: boolean) => void;
		onFavoriteToggleRevert?: (id: number | string) => void;
	}

	let {
		item,
		favoriteAction,
		actions,
		mainActionLabel,
		scrapAction,
		onFavoriteToggle,
		onFavoriteToggleRevert
	}: Props = $props();

	const primaryAction = $derived(actions[0] ?? null);
	const showStub = $derived(Boolean(primaryAction && mainActionLabel));

	let stubTearing = $state(false);

	function posterUrl(path: string | null | undefined): string | null {
		if (!path) return null;
		return `${TMDB_POSTER_BASE}/w154${path}`;
	}

	const clipId = $derived(`ticket-clip-${item.id}`);
	const cardColor = $derived(getCardColor(item.id));
	const cardStyle = $derived(
		`--color-ticket: ${cardColor.bg}; --color-ticket-stub: ${cardColor.stub}; --color-ticket-text: ${cardColor.text}; --color-ticket-text-muted: ${cardColor.textMuted};`
	);
</script>

<!-- Hidden SVG with clipPath definitions -->
<svg width="0" height="0" style="position: absolute;">
	<defs>
		<clipPath id="{clipId}-body" clipPathUnits="objectBoundingBox">
			<!-- ticket-left.svg path scaled to 0-1 range (original 248x144) -->
			<path d="
				M0.9758 0
				C0.9758 0.023 0.9866 0.0417 1 0.0417
				V0.0694
				C0.9866 0.0694 0.9758 0.088 0.9758 0.1111
				C0.9758 0.1343 0.9866 0.1528 1 0.1528
				V0.1806
				C0.9866 0.1806 0.9758 0.1991 0.9758 0.2222
				C0.9758 0.2454 0.9866 0.2639 1 0.2639
				V0.2917
				C0.9866 0.2917 0.9758 0.3102 0.9758 0.3333
				C0.9758 0.3565 0.9866 0.375 1 0.375
				V0.4028
				C0.9866 0.4028 0.9758 0.4213 0.9758 0.4444
				C0.9758 0.4676 0.9866 0.4861 1 0.4861
				V0.5139
				C0.9866 0.5139 0.9758 0.5324 0.9758 0.5556
				C0.9758 0.5787 0.9866 0.5972 1 0.5972
				V0.625
				C0.9866 0.625 0.9758 0.6435 0.9758 0.6667
				C0.9758 0.6898 0.9866 0.7083 1 0.7083
				V0.7361
				C0.9866 0.7361 0.9758 0.7546 0.9758 0.7778
				C0.9758 0.8009 0.9866 0.8194 1 0.8194
				V0.8472
				C0.9866 0.8472 0.9758 0.8657 0.9758 0.8889
				C0.9758 0.912 0.9866 0.9306 1 0.9306
				V0.9583
				C0.9866 0.9583 0.9758 0.9769 0.9758 1
				H0.0484
				C0.0217 1 0 0.9627 0 0.9167
				V0.0833
				C0 0.0373 0.0217 0 0.0484 0
				H0.9758
				Z
			"/>
		</clipPath>
		<clipPath id="{clipId}-stub" clipPathUnits="objectBoundingBox">
			<!-- ticket-right.svg path scaled to 0-1 range (original 80x144) -->
			<path d="
				M0.85 0
				C0.9328 0 1 0.0373 1 0.0833
				V0.9167
				C1 0.9627 0.9328 1 0.85 1
				H0.075
				C0.075 0.9769 0.0414 0.9583 0 0.9583
				V0.9306
				C0.0414 0.9306 0.075 0.912 0.075 0.8889
				C0.075 0.8657 0.0414 0.8472 0 0.8472
				V0.8194
				C0.0414 0.8194 0.075 0.8009 0.075 0.7778
				C0.075 0.7546 0.0414 0.7361 0 0.7361
				V0.7083
				C0.0414 0.7083 0.075 0.6898 0.075 0.6667
				C0.075 0.6435 0.0414 0.625 0 0.625
				V0.5972
				C0.0414 0.5972 0.075 0.5787 0.075 0.5556
				C0.075 0.5324 0.0414 0.5139 0 0.5139
				V0.4861
				C0.0414 0.4861 0.075 0.4676 0.075 0.4444
				C0.075 0.4213 0.0414 0.4028 0 0.4028
				V0.375
				C0.0414 0.375 0.075 0.3565 0.075 0.3333
				C0.075 0.3102 0.0414 0.2917 0 0.2917
				V0.2639
				C0.0414 0.2639 0.075 0.2454 0.075 0.2222
				C0.075 0.1991 0.0414 0.1806 0 0.1806
				V0.1528
				C0.0414 0.1528 0.075 0.1343 0.075 0.1111
				C0.075 0.088 0.0414 0.0694 0 0.0694
				V0.0417
				C0.0414 0.0417 0.075 0.023 0.075 0
				H0.85
				Z
			"/>
		</clipPath>
	</defs>
</svg>

<li class="ticket-wrapper" style={cardStyle}>
	<div class="ticket">
		<!-- Left body panel: movie info -->
		<div class="ticket-body" style="clip-path: url(#{clipId}-body);">
			<div class="ticket-body-inner">
				{#if posterUrl(item.poster_path)}
					<img
						src={posterUrl(item.poster_path)!}
						alt=""
						class="ticket-poster"
						width="80"
						height="120"
					/>
				{:else}
					<span class="ticket-poster ticket-poster--placeholder" aria-hidden="true">
						<Film size={24} />
					</span>
				{/if}

				<div class="ticket-info">
					<span class="ticket-title">{item.title}</span>
					{#if item.year != null}
						<span class="ticket-year">{item.year}</span>
					{/if}
					{#if !showStub && actions.length > 0}
						<div class="ticket-actions">
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
									class="ticket-action-form"
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
									>
										{#snippet children()}
											{@const ActionIcon = action.icon}
											<ActionIcon size={16} aria-hidden="true" />
											{#if !action.iconOnly}
												<span>{action.label}</span>
											{/if}
										{/snippet}
									</Button>
								</form>
							{/each}
						</div>
					{/if}
				</div>

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
						class="ticket-star-form"
						data-sveltekit-noscroll
					>
						{#each favoriteAction.hiddenFields as field}
							<input type="hidden" name={field.name} value={field.value} />
						{/each}
						<Button variant="star" type="submit" ariaLabel={favoriteAction.ariaLabel}>
							{#snippet children()}
								{@const Icon = favoriteAction.icon}
								<Icon size={16} class={item.favorite ? 'filled' : ''} aria-hidden="true" />
							{/snippet}
						</Button>
					</form>
				{/if}

				{#if scrapAction}
					<form
						method="post"
						action={scrapAction.formAction}
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
						class="ticket-remove-form"
						data-sveltekit-noscroll
					>
						{#each scrapAction.hiddenFields as field}
							<input type="hidden" name={field.name} value={field.value} />
						{/each}
						<Button variant="ghost" size="small" type="submit" ariaLabel="Remove" class="btn--remove">
							{#snippet children()}
								<X size={14} aria-hidden="true" />
							{/snippet}
						</Button>
					</form>
				{/if}
			</div>
		</div>

		<!-- Right stub panel: rippable primary action -->
		{#if showStub && primaryAction}
			<form
				method="post"
				action={primaryAction.formAction}
				class="ticket-stub"
				class:ticket-stub--tearing={stubTearing}
				class:ticket-stub--watched={item.watched}
				style="clip-path: url(#{clipId}-stub);"
				use:enhance={({ submitter }) => {
					const scrollY = window.scrollY;
					const focusTarget = submitter ?? undefined;
					stubTearing = true;
					return async ({ update }) => {
						await update();
						stubTearing = false;
						requestAnimationFrame(() => {
							window.scrollTo(0, scrollY);
							if (focusTarget?.isConnected && typeof focusTarget.focus === 'function') {
								focusTarget.focus({ preventScroll: true });
							}
						});
					};
				}}
				data-sveltekit-noscroll
			>
				{#each primaryAction.hiddenFields as field}
					<input type="hidden" name={field.name} value={field.value} />
				{/each}
				<button
					type="submit"
					class="stub-button"
					aria-label={primaryAction.ariaLabel ?? primaryAction.label}
				>
					{#if item.watched}
						{@const Icon = primaryAction.icon}
						<Icon size={20} class="stub-icon" aria-hidden="true" />
					{:else}
						<span class="stub-label">{mainActionLabel}</span>
					{/if}
				</button>
			</form>
		{/if}
	</div>
</li>

<style>
	.ticket-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.ticket-wrapper:last-child {
		margin-bottom: 0;
	}

	.ticket {
		display: flex;
		align-items: stretch;
		height: 180px;
		filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
	}

	.ticket-body {
		width: 320px;
		height: 180px;
		flex-shrink: 0;
		background: var(--color-ticket);
		transition: background 0.15s ease;
	}

	.ticket-body:hover {
		background: var(--color-ticket-stub);
	}

	.ticket-body-inner {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		padding-right: var(--space-4);
		box-sizing: border-box;
	}

	.ticket-poster {
		width: 80px;
		height: 120px;
		object-fit: cover;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.ticket-poster--placeholder {
		width: 80px;
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.08);
		color: var(--color-ticket-text-muted);
		border-radius: var(--radius-sm);
	}

	.ticket-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.ticket-title {
		font-family: var(--font-condensed);
		font-size: var(--font-size-md);
		font-weight: 600;
		color: var(--color-ticket-text);
		line-height: 1.2;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.ticket-year {
		font-family: var(--font-condensed);
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-ticket-text-muted);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.ticket-actions {
		display: flex;
		gap: var(--space-1);
		margin-top: var(--space-1);
		flex-wrap: wrap;
	}

	.ticket-action-form {
		margin: 0;
	}

	.ticket-star-form {
		flex-shrink: 0;
		align-self: flex-start;
		margin: 0;
	}

	.ticket-star-form :global(.btn--star) {
		color: var(--color-ticket-text-muted);
		min-width: 2rem;
		min-height: 2rem;
	}

	.ticket-star-form :global(.btn--star:hover) {
		color: var(--color-ticket-text);
		background: rgba(0, 0, 0, 0.1);
	}

	.ticket-star-form :global(.btn--star svg.filled) {
		fill: var(--color-ticket-text);
		stroke: var(--color-ticket-text);
	}

	.ticket-stub {
		width: 80px;
		height: 180px;
		flex-shrink: 0;
		background: var(--color-ticket-stub);
		margin: 0;
		cursor: pointer;
		transition:
			background 0.15s ease,
			transform 0.35s cubic-bezier(0.4, 0, 0.8, 0.6),
			opacity 0.35s ease;
	}

	.ticket-stub:hover {
		filter: brightness(1.1);
	}

	@keyframes tear-off {
		to {
			transform: translateX(110%);
			opacity: 0;
		}
	}

	.ticket-stub--tearing {
		animation: tear-off 0.35s cubic-bezier(0.4, 0, 0.8, 0.6) forwards;
	}

	.ticket-stub--watched {
		background: transparent;
	}

	.ticket-stub--watched:hover {
		background: var(--color-surface-hover, rgba(0, 0, 0, 0.05));
	}

	.stub-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: var(--space-2);
	}

	.stub-label {
		font-family: var(--font-condensed);
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--color-ticket-text);
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		white-space: nowrap;
		user-select: none;
	}

	.stub-button :global(.stub-icon) {
		color: var(--color-text-muted);
		opacity: 0;
		transition: color 0.15s ease, opacity 0.15s ease;
	}

	.ticket-stub--watched:hover .stub-button :global(.stub-icon) {
		color: var(--color-text);
		opacity: 0.6;
	}

	.ticket-remove-form {
		position: absolute;
		top: var(--space-1);
		right: var(--space-2);
		margin: 0;
	}

	.ticket-remove-form :global(.btn--remove) {
		--remove-size: 22px;
		padding: 0;
		width: var(--remove-size);
		height: var(--remove-size);
		min-width: var(--remove-size);
		min-height: var(--remove-size);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		color: var(--color-ticket-text-muted);
		background: transparent;
		opacity: 0;
		transition:
			opacity 0.15s ease,
			color 0.15s ease,
			background 0.15s ease,
			transform 0.1s ease;
	}

	.ticket-body:hover .ticket-remove-form :global(.btn--remove),
	.ticket-remove-form :global(.btn--remove:focus-visible) {
		opacity: 0.6;
	}

	.ticket-remove-form :global(.btn--remove:hover) {
		opacity: 1;
		color: var(--color-ticket-text);
		background: rgba(0, 0, 0, 0.1);
		transform: scale(1.1);
	}

	.ticket-remove-form :global(.btn--remove:active) {
		transform: scale(0.95);
	}
</style>
