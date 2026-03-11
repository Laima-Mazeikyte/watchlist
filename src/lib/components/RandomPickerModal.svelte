<script lang="ts">
	import { X, Film } from 'lucide-svelte';
	import type { ListEntry } from '$lib/types';

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
		open: boolean;
		items: ListEntry[];
		onClose: () => void;
	}

	let { open, items, onClose }: Props = $props();

	let selectedMovie = $state<ListEntry | null>(null);
	let displayedMovie = $state<ListEntry | null>(null);
	let isSpinning = $state(false);
	let showFinalReveal = $state(false);

	function posterUrl(path: string | null | undefined): string | null {
		if (!path) return null;
		return `${TMDB_POSTER_BASE}/w154${path}`;
	}

	const clipId = $derived(displayedMovie ? `picker-clip-${displayedMovie.id}` : 'picker-clip-0');
	const cardColor = $derived(displayedMovie ? getCardColor(displayedMovie.id) : CARD_COLORS[0]);
	const cardStyle = $derived(
		`--color-ticket: ${cardColor.bg}; --color-ticket-stub: ${cardColor.stub}; --color-ticket-text: ${cardColor.text}; --color-ticket-text-muted: ${cardColor.textMuted};`
	);

	function startPicker() {
		if (items.length < 2) return;

		showFinalReveal = false;
		isSpinning = true;

		const winner = items[Math.floor(Math.random() * items.length)];
		selectedMovie = winner;

		let interval = 40;
		const maxInterval = 200;
		let lastIndex = -1;

		function cycle() {
			let newIndex: number;
			do {
				newIndex = Math.floor(Math.random() * items.length);
			} while (newIndex === lastIndex && items.length > 1);
			lastIndex = newIndex;

			displayedMovie = items[newIndex];
			interval += 15;

			if (interval < maxInterval) {
				setTimeout(cycle, interval);
			} else {
				displayedMovie = winner;
				isSpinning = false;
				setTimeout(() => {
					showFinalReveal = true;
				}, 100);
			}
		}

		cycle();
	}

	$effect(() => {
		if (open && items.length >= 2) {
			selectedMovie = null;
			displayedMovie = null;
			showFinalReveal = false;
			setTimeout(startPicker, 200);
		}
	});

	$effect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	});
</script>

<svg width="0" height="0" style="position: absolute;">
	<defs>
		<clipPath id="{clipId}-body" clipPathUnits="objectBoundingBox">
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

{#if open}
	<div
		class="picker-backdrop"
		class:revealed={showFinalReveal}
		role="presentation"
		onclick={(e) => e.target === e.currentTarget && onClose()}
	>
		<div
			class="picker-container"
			role="dialog"
			aria-modal="true"
			aria-labelledby="picker-title"
		>
			<button
				type="button"
				class="close-button"
				aria-label="Close"
				onclick={onClose}
			>
				<X size={24} aria-hidden="true" />
			</button>

			<h2 id="picker-title" class="picker-title">
				{isSpinning ? 'Picking a movie...' : 'Your pick!'}
			</h2>

			{#if displayedMovie}
				<div class="ticket-container" class:spinning={isSpinning} class:revealed={showFinalReveal} style={cardStyle}>
					<div class="ticket">
						<div class="ticket-body" style="clip-path: url(#{clipId}-body);">
							<div class="ticket-body-inner">
								{#if posterUrl(displayedMovie.poster_path)}
									<img
										src={posterUrl(displayedMovie.poster_path)!}
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
									<span class="ticket-title">{displayedMovie.title}</span>
									{#if displayedMovie.year != null}
										<span class="ticket-year">{displayedMovie.year}</span>
									{/if}
								</div>
							</div>
						</div>

						<div class="ticket-stub" style="clip-path: url(#{clipId}-stub);">
							<span class="stub-label">Watch</span>
						</div>
					</div>
				</div>
			{:else}
				<div class="ticket-container placeholder" style="--color-ticket: #C6BA88; --color-ticket-stub: #b8ab79; --color-ticket-text: #3d3a2e; --color-ticket-text-muted: #5c5746;">
					<div class="ticket">
						<div class="ticket-body" style="clip-path: url(#{clipId}-body);">
							<div class="ticket-body-inner">
								<span class="ticket-poster ticket-poster--placeholder" aria-hidden="true">
									<Film size={24} />
								</span>
								<div class="ticket-info">
									<span class="ticket-title">...</span>
								</div>
							</div>
						</div>
						<div class="ticket-stub" style="clip-path: url(#{clipId}-stub);">
							<span class="stub-label">Watch</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.picker-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
		animation: backdropFadeIn 0.3s ease-out;
	}

	.picker-backdrop.revealed {
		background: rgba(0, 0, 0, 0.85);
	}

	@keyframes backdropFadeIn {
		from {
			opacity: 0;
			backdrop-filter: blur(0);
		}
		to {
			opacity: 1;
			backdrop-filter: blur(8px);
		}
	}

	.picker-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-6);
		padding: var(--space-8);
		max-width: 500px;
		width: 100%;
	}

	.close-button {
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2);
		background: rgba(255, 255, 255, 0.1);
		border: none;
		border-radius: var(--radius-md);
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}

	.close-button:hover {
		background: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.picker-title {
		margin: 0;
		font-family: var(--font-condensed);
		font-size: 1.75rem;
		font-weight: 600;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-align: center;
	}

	.ticket-container {
		transition: transform 0.2s, filter 0.3s;
	}

	.ticket-container.spinning {
		animation: ticketPulse 0.08s ease-in-out infinite;
	}

	.ticket-container.revealed {
		transform: scale(1.08);
		filter: drop-shadow(0 0 40px var(--color-ticket));
	}

	.ticket-container.placeholder {
		opacity: 0.5;
	}

	@keyframes ticketPulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(0.97);
		}
	}

	.ticket {
		display: flex;
		align-items: stretch;
		height: 180px;
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
	}

	.ticket-body {
		width: 320px;
		height: 180px;
		flex-shrink: 0;
		background: var(--color-ticket);
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
		font-family: var(--font-slab);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-ticket-text);
		line-height: 1.2;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.ticket-year {
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-ticket-text-muted);
		letter-spacing: 0.02em;
	}

	.ticket-stub {
		width: 80px;
		height: 180px;
		flex-shrink: 0;
		background: var(--color-ticket-stub);
		display: flex;
		align-items: center;
		justify-content: center;
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
</style>
