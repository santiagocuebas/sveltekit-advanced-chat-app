<script lang="ts">
	import { DIR } from '$lib/config.js';
	import { DataRegister } from '$lib/register.js';
	import { setUppercaseFirstLetter, setType } from '$lib/services/libs.js';
	import { checks } from '$lib/services/validations.js';
  import { register } from '$lib/store';
	import Input from '$lib/components/Input.svelte';
	import Form from '$lib/components/Form.svelte';
	import Box from '$lib/components/ErrorBox.svelte';

	const properInput = ['username', 'email', 'password'];
	let visible = false;

	const valueInput = new DataRegister('', '', '', '');
	const errorMessage = new DataRegister('', '', '', '');
	const activeError = new DataRegister(false, false, false, false);

	const setMessage = (key: string, message: string) => {
		activeError[key] = true;
		errorMessage[key] = message;
	};
</script>

<Form
	action={DIR + '/api/auth/register'}
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
			type={setType(key)}
			name={key}
			bind:input={valueInput[key]}
			bind:error={errorMessage[key]}
			bind:active={activeError[key]}
			check={checks[key]}
		/>
	{/each}
	{#if valueInput['password']}
		<Input
			text='Confirm Password'
			type={'password'}
			name='confirmPassword'
			bind:input={valueInput['confirmPassword']}
			bind:error={errorMessage['confirmPassword']}
			bind:active={activeError['confirmPassword']}
			check={checks['confirmPassword']}
			bind:pass={valueInput['password']}
		/>
	{/if}
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
