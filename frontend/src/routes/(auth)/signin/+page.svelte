<script lang="ts">
	import { DIR } from '$lib/config.js';
	import { DataSignin } from '$lib/register.js';
	import Input from '$lib/components/Input.svelte';
	import Form from '$lib/components/Form.svelte';
	import Box from '$lib/components/ErrorBox.svelte';
	import { setUppercaseFirstLetter } from '$lib/services/set-uppercase.js';
	import { checks } from '$lib/services/validations.js';

	const properInput = ['email', 'password'];
	let visible = false;

	const valueInput = new DataSignin('', '');
	const errorMessage = new DataSignin('', '');
	const activeError = new DataSignin(false, false);

	const setMessage = (key: string, message: string) => {
		activeError[key] = true;
		errorMessage[key] = message;
	};
</script>

<Form
	action={DIR + '/api/auth/signin'}
	inputs={valueInput}
	set={setMessage}
	bind:visible={visible}
>
	{#if visible}
		<Box />
	{/if}
	{#each properInput as key (key)}
		<Input
			text={setUppercaseFirstLetter(key)}
			name={key}
			bind:input={valueInput[key]}
			bind:error={errorMessage[key]}
			bind:active={activeError[key]}
			check={checks[key]}
			pass={undefined}
		/>
	{/each}
	<button class="signin">
		Sign In
	</button>
</Form>
<a href="/register" class="register">
	Create Account
</a>

<style lang="postcss">
	.signin, .register {
		width: 200px;
		@apply py-3.5 rounded-sm bg-black shadow-black text-center font-bold text-white cursor-pointer;
	}

	.register {
		@apply bg-white text-blue shadow-blue;
	}
</style>
