<script lang="ts">
	import { enhance } from '$app/forms';
	import { Film, LogOut, Plus, Check, RotateCcw, Trash2 } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<main class="page">
	<header class="header">
		<h1 class="title">
			<Film size={24} class="title-icon" aria-hidden="true" />
			Watchlist
		</h1>
		<div class="header-actions">
			<span class="signed-in">Signed in as <strong>{data.user.name}</strong></span>
			<form method="post" action="?/signOut" use:enhance>
				<button type="submit" class="btn btn--secondary btn--icon">
					<LogOut size={18} aria-hidden="true" />
					Sign out
				</button>
			</form>
		</div>
	</header>

	<section class="section" aria-labelledby="add-heading">
		<h2 id="add-heading" class="section-title">Add a movie</h2>
		<form
			method="post"
			action="?/addMovie"
			use:enhance={({ formElement }) => {
				return async ({ result, update }) => {
					await update();
					if (result.type === 'redirect') formElement.reset();
				};
			}}
			class="form"
		>
			<label for="title" class="label">Title</label>
			<input id="title" type="text" name="title" required autocomplete="off" class="input" />
			<button type="submit" class="btn btn--primary btn--icon">
				<Plus size={18} aria-hidden="true" />
				Add movie
			</button>
			{#if form?.message}
				<p role="alert" aria-live="polite" class="error">{form.message}</p>
			{/if}
		</form>
	</section>

	<section class="section" aria-labelledby="list-heading">
		<h2 id="list-heading" class="section-title">Your list</h2>
		{#if data.watchlist.length === 0}
			<p class="empty">No movies yet. Add one above.</p>
		{:else}
			<ul class="list">
				{#each data.watchlist as m (m.id)}
					<li class="list-item">
						<span class="list-item-title">{m.title}</span>
						<div class="list-item-actions">
							<form method="post" action="?/markWatched" use:enhance class="list-item-form">
								<input type="hidden" name="id" value={m.id} />
								<button type="submit" class="btn btn--secondary btn--small btn--icon">
									<Check size={16} aria-hidden="true" />
									Mark as watched
								</button>
							</form>
							<form method="post" action="?/deleteMovie" use:enhance class="list-item-form">
								<input type="hidden" name="id" value={m.id} />
								<button type="submit" class="btn btn--secondary btn--small btn--icon">
									<Trash2 size={16} aria-hidden="true" />
									Remove
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="section" aria-labelledby="watched-heading">
		<h2 id="watched-heading" class="section-title">Watched</h2>
		{#if data.watched.length === 0}
			<p class="empty">No watched movies yet.</p>
		{:else}
			<ul class="list">
				{#each data.watched as m (m.id)}
					<li class="list-item">
						<span class="list-item-title">{m.title}</span>
						<div class="list-item-actions">
							<form method="post" action="?/markUnwatched" use:enhance class="list-item-form">
								<input type="hidden" name="id" value={m.id} />
								<button type="submit" class="btn btn--secondary btn--small btn--icon">
									<RotateCcw size={16} aria-hidden="true" />
									Mark as unwatched
								</button>
							</form>
							<form method="post" action="?/deleteMovie" use:enhance class="list-item-form">
								<input type="hidden" name="id" value={m.id} />
								<button type="submit" class="btn btn--secondary btn--small btn--icon">
									<Trash2 size={16} aria-hidden="true" />
									Remove
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>

<style>
	.page {
		max-width: 36rem;
		margin: 0 auto;
		padding: var(--space-7) var(--space-5);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
		padding-bottom: var(--space-6);
		border-bottom: var(--border-width-thin) solid var(--color-border);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.signed-in {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.signed-in strong {
		font-weight: 600;
		color: var(--color-text-strong);
	}

	.title {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.btn--icon {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.section {
		margin-bottom: var(--space-8);
	}

	.section:last-child {
		margin-bottom: 0;
	}

	.section-title {
		margin: 0 0 var(--space-4);
		font-size: var(--font-size-md);
		font-weight: 600;
		color: var(--color-text-strong);
	}

	.form {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: var(--space-3) var(--space-4);
	}

	.label {
		display: block;
		width: 100%;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-strong);
	}

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

	.btn {
		height: 2.5rem;
		padding: var(--space-2) var(--space-4);
		font: inherit;
		font-size: var(--font-size-ui);
		font-weight: 500;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
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

	.error {
		margin: var(--space-2) 0 0;
		font-size: var(--font-size-sm);
		color: var(--color-error);
	}

	.empty {
		margin: 0;
		color: var(--color-text-muted);
		font-size: var(--font-size-ui);
	}

	.list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

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

	.btn--small {
		height: 2rem;
		padding: var(--space-1) var(--space-2);
		font-size: var(--font-size-xs);
	}

	.list-item:last-child {
		margin-bottom: 0;
	}
</style>
