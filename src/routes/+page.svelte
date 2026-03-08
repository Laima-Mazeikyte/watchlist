<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<main>
	<header>
		<h1>Watchlist</h1>
		<form method="post" action="?/signOut" use:enhance>
			<button type="submit">Sign out</button>
		</form>
	</header>

	<section aria-labelledby="add-heading">
		<h2 id="add-heading">Add a movie</h2>
		<form method="post" action="?/addMovie" use:enhance>
			<label for="title">Title</label>
			<input id="title" type="text" name="title" required autocomplete="off" />
			<button type="submit">Add movie</button>
			{#if form?.message}
				<p role="alert" aria-live="polite" class="error">{form.message}</p>
			{/if}
		</form>
	</section>

	<section aria-labelledby="list-heading">
		<h2 id="list-heading">Your list</h2>
		{#if data.movies.length === 0}
			<p>No movies yet. Add one above.</p>
		{:else}
			<ul>
				{#each data.movies as m (m.id)}
					<li>{m.title}</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>

<style>
	.error {
		color: #b91c1c;
	}
</style>
