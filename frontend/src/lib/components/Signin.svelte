<script lang="ts">
	import type { IKeys } from '$lib/types/global';
  import { onDestroy, onMount } from 'svelte';
	import { DIR } from '$lib/config.js';
  import { register, valueInput, errorMessage, activeError } from '$lib/store';
	import Input from '$lib/components/Input.svelte';
	import Form from '$lib/components/Form.svelte';
	import Box from '$lib/components/ErrorBox.svelte';
	import { setType, changeName } from '$lib/services/libs.js';
	import { checks } from '$lib/services/validations.js';

	const properInput = ['email', 'password'];
	let visible = false;
	let input: IKeys<string>;
	let error: IKeys<string>;
	let active: IKeys<boolean>;

	const unsubInput = valueInput.subscribe(value => input = value as IKeys<string>);
	const unsubError = errorMessage.subscribe(value => error = value as IKeys<string>);
	const unsubActive = activeError.subscribe(value => active = value as IKeys<boolean>);

	onMount(() => {
		valueInput.setOptions({ email: '', password: '' });
		errorMessage.setOptions({ email: '', password: '' });
		activeError.setOptions({ email: false, password: false });
	});
	
	onDestroy(() => {
		return {
			unsubInput,
			unsubError,
			unsubActive
		}
	});
</script>

<Form action={DIR + '/api/auth/signin'} bind:visible={visible}>
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
		/>
	{/each}
	<button class="signin">
		Sign In
	</button>
</Form>
<button class="register" on:click={() => register.setOption('register')}>
	Create Account
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
