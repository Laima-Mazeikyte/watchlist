<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<main class="page">
	<header class="header">
		<h1 class="title">Watchlist</h1>
		<form method="post" action="?/signOut" use:enhance>
			<button type="submit" class="btn btn--secondary">Sign out</button>
		</form>
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
			<button type="submit" class="btn btn--primary">Add movie</button>
			{#if form?.message}
				<p role="alert" aria-live="polite" class="error">{form.message}</p>
			{/if}
		</form>
	</section>

	<section class="section" aria-labelledby="list-heading">
		<h2 id="list-heading" class="section-title">Your list</h2>
		{#if data.movies.length === 0}
			<p class="empty">No movies yet. Add one above.</p>
		{:else}
			<ul class="list">
				{#each data.movies as m (m.id)}
					<li class="list-item">{m.title}</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>

<style>
	.page {
		max-width: 36rem;
		margin: 0 auto;
		padding: 2rem 1.25rem;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 2.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #e5e5e5;
	}

	.title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.section {
		margin-bottom: 2.5rem;
	}

	.section:last-child {
		margin-bottom: 0;
	}

	.section-title {
		margin: 0 0 1rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: #333;
	}

	.form {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.75rem 1rem;
	}

	.label {
		display: block;
		width: 100%;
		font-size: 0.875rem;
		font-weight: 500;
		color: #444;
	}

	.input {
		flex: 1;
		min-width: 12rem;
		height: 2.5rem;
		padding: 0.5rem 0.75rem;
		font: inherit;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		background: #fff;
	}

	.input:focus {
		outline: none;
		border-color: #666;
		box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
	}

	.btn {
		height: 2.5rem;
		padding: 0.5rem 1rem;
		font: inherit;
		font-size: 0.9375rem;
		font-weight: 500;
		border: none;
		border-radius: 6px;
		cursor: pointer;
	}

	.btn--primary {
		background: #1a1a1a;
		color: #fff;
	}

	.btn--primary:hover {
		background: #333;
	}

	.btn--secondary {
		background: #e5e5e5;
		color: #1a1a1a;
	}

	.btn--secondary:hover {
		background: #d4d4d4;
	}

	.error {
		margin: 0.5rem 0 0;
		font-size: 0.875rem;
		color: #b91c1c;
	}

	.empty {
		margin: 0;
		color: #666;
		font-size: 0.9375rem;
	}

	.list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.list-item {
		padding: 0.625rem 0.75rem;
		margin-bottom: 0.25rem;
		background: #fff;
		border: 1px solid #e5e5e5;
		border-radius: 6px;
		font-size: 0.9375rem;
	}

	.list-item:last-child {
		margin-bottom: 0;
	}
</style>
