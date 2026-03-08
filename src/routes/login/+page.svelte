<script lang="ts">
	import { enhance } from '$app/forms';
	import { Mail, Lock, User, LogIn, UserPlus } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main class="login-page">
	<h1 class="login-title">Log in</h1>
	<form method="post" action="?/signInEmail" use:enhance class="login-form">
		<div class="login-field">
			<label for="email" class="login-label">
				<Mail size={16} aria-hidden="true" />
				Email
			</label>
			<input id="email" type="email" name="email" required autocomplete="email" class="login-input" />
		</div>
		<div class="login-field">
			<label for="password" class="login-label">
				<Lock size={16} aria-hidden="true" />
				Password
			</label>
			<input id="password" type="password" name="password" required autocomplete="current-password" class="login-input" />
		</div>
		<div class="login-field">
			<label for="name" class="login-label">
				<User size={16} aria-hidden="true" />
				Name (for registration)
			</label>
			<input id="name" type="text" name="name" autocomplete="name" class="login-input" />
		</div>
		<div class="login-actions">
			<button type="submit" class="btn btn--primary btn--icon">
				<LogIn size={18} aria-hidden="true" />
				Log in
			</button>
			<button type="submit" formaction="?/signUpEmail" class="btn btn--secondary btn--icon">
				<UserPlus size={18} aria-hidden="true" />
				Register
			</button>
		</div>
		{#if form?.message}
			<p role="alert" aria-live="polite" class="error">{form.message}</p>
		{/if}
	</form>
</main>

<style>
	.login-page {
		max-width: 24rem;
		margin: 0 auto;
		padding: var(--space-7) var(--space-5);
	}

	.login-title {
		margin: 0 0 var(--space-6);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text);
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.login-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.login-label {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-strong);
	}

	.btn--icon {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.login-input {
		height: 2.5rem;
		padding: var(--space-2) var(--space-3);
		font: inherit;
		font-size: var(--font-size-base);
		border: var(--border-width-thin) solid var(--color-border-input);
		border-radius: var(--radius-md);
		background: var(--color-input-bg);
		color: var(--color-text);
	}

	.login-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-1);
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
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-error);
	}
</style>
