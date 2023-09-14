<script lang="ts">
	import type { IKeys } from '$lib/types/global';
	import { onDestroy, onMount } from 'svelte';
	import { DIR } from '$lib/config.js';
	import { changeName, setType } from '$lib/services/libs';
	import { checks } from '$lib/services/validations.js';
  import { register, valueInput, errorMessage, activeError } from '$lib/store';
	import Input from '$lib/components/Input.svelte';
	import Form from '$lib/components/Form.svelte';
	import Box from '$lib/components/ErrorBox.svelte';

	const properInput = ['username', 'email', 'password', 'confirmPassword'];
	let visible = false;
	let input: IKeys<string>;
	let error: IKeys<string>;
	let active: IKeys<boolean>;

	const unsubInput = valueInput.subscribe(value => input = value as IKeys<string>);
	const unsubError = errorMessage.subscribe(value => error = value as IKeys<string>);
	const unsubActive = activeError.subscribe(value => active = value as IKeys<boolean>);

	onMount(() => {
		valueInput.setOptions({
			username: '',
			email: '',
			password: '',
			confirmPassword: ''
		});
		errorMessage.setOptions({
			username: '',
			email: '',
			password: '',
			confirmPassword: ''
		});
		activeError.setOptions({
			username: false,
			email: false,
			password: false,
			confirmPassword: false
		});
	});

	onDestroy(() => {
		return {
			unsubInput,
			unsubError,
			unsubActive
		}
	});
</script>

<Form action={DIR + '/api/auth/register'} bind:visible={visible}>
	{#if visible}
		<Box />
	{/if}
	{#each properInput as key (key)}
		<Input
			text={changeName(key)}
			type={setType(key)}
			name={key}
			bind:input={input[key]}
			bind:error={error[key]}
			bind:active={active[key]}
			check={checks[key]}
			bind:pass={input['password']}
		/>
	{/each}
	<button class="signin">
		Register
	</button>
</Form>
<button class="register" on:click={() => register.setOption('signin')}>
	Sign In
</button>

<style lang="postcss">
	.signin, .register {
		width: 200px;
		@apply py-3.5 rounded-sm bg-black shadow-black text-center font-bold text-white cursor-pointer;
	}

	.register {
		@apply bg-white text-blue shadow-blue;
	}
</style>
