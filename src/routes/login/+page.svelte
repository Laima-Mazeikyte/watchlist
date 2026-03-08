<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main>
	<h1>Log in</h1>
	<form method="post" action="?/signInEmail" use:enhance>
		<div>
			<label for="email">Email</label>
			<input id="email" type="email" name="email" required autocomplete="email" />
		</div>
		<div>
			<label for="password">Password</label>
			<input id="password" type="password" name="password" required autocomplete="current-password" />
		</div>
		<div>
			<label for="name">Name (for registration)</label>
			<input id="name" type="text" name="name" autocomplete="name" />
		</div>
		<div>
			<button type="submit">Log in</button>
			<button type="submit" formaction="?/signUpEmail">Register</button>
		</div>
		{#if form?.message}
			<p role="alert" aria-live="polite" class="error">{form.message}</p>
		{/if}
	</form>
</main>

<style>
	.error {
		color: #b91c1c;
	}
</style>
