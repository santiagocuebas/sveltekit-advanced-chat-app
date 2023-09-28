<script lang="ts">
	import type { IKeys, ResponseData } from '$lib/types/global';
	import { onDestroy, onMount } from 'svelte';
	import axios from 'axios';
	import { DIR } from '$lib/config.js';
  import { avatarURL } from '$lib/dictionary';
  import { socket } from '$lib/socket';
	import { changeName, setType } from '$lib/services/libs';
	import { isValidInput, isValidLength } from '$lib/services/validation-submit';
	import { checks } from '$lib/services/validations.js';
  import {
		user,
		register,
		valueInput,
		errorMessage,
		activeError
	} from '$lib/store';
  import { Inputs, Option } from '$lib/types/enums';
	import Input from '$lib/components/Input.svelte';

  export let title: string;
  export let option: string = '';
  export let inputs: string[] | undefined = undefined;

	let visible = false;
	let input: IKeys<string>;
	let error: IKeys<string | undefined>;
	let active: IKeys<boolean>;

	const unsubInput = valueInput.subscribe(value => input = value as IKeys<string>);
	const unsubError = errorMessage.subscribe(value => error = value as IKeys<string | undefined>);
	const unsubActive = activeError.subscribe(value => active = value as IKeys<boolean>);

	async function handleSubmit(this: HTMLFormElement) {
		visible = false;

		if (isValidLength(input) && isValidInput(input)) {
			const data: ResponseData = await axios({
				method: this.method,
				url: this.action,
				withCredentials: true,
				data: this
			}).then(res => res.data)
				.catch(err => err.response ? err.response.data : visible = true);

			if (data.user) {
				user.setUser(data.user);
				socket.auth = { sessionID: $user.id };
				socket.connect();
				register.setOption(Option.USER);
			} else if (data.errors) {
				for (const error of Object.keys(data.errors)) {
					if (data.errors[error]) {
						activeError.setOption(error, true);
						errorMessage.setOption(error, data.errors[error]);
					}
				}
			} else if (data.error) console.log(data.error);
		}
	}

	onMount(() => {
		if (inputs !== undefined) {
			valueInput.setOptions(inputs, '');
			errorMessage.setOptions(inputs, '');
			activeError.setOptions(inputs, false);
		}
	});

	onDestroy(() => {
		return {
			unsubInput,
			unsubError,
			unsubActive
		}
	});
</script>

<div class="sign">
	{#if inputs === undefined}
		<img src="/images.svg" alt="title">
	{/if}
  <h1>{changeName(title)}</h1>
  {#if inputs !== undefined}
		<form
			action={DIR + avatarURL[title]}
			method='POST'
			on:submit|preventDefault={handleSubmit}
		>
			{#if visible}
				<div>An error occurred while trying to connect to the server</div>
			{/if}
			{#each inputs as key (key)}
				<Input
					text={changeName(key)}
					type={setType(key)}
					name={key}
					bind:input={input[key]}
					bind:error={error[key]}
					bind:active={active[key]}
					check={checks[key]}
					bind:pass={input[Inputs.PASSWORD]}
				/>
			{/each}
			<button class="accept">
				{changeName(title)}
			</button>
		</form>
		<button class="change" on:click={() => register.setOption(option)}>
			{option === Option.REGISTER ? 'Create Account' : 'Sign In'}
		</button>
	{/if}
</div>

<style lang="postcss">
	.sign {
		grid-auto-rows: min-content;
		grid-column: 1 / span 2;
		grid-row: 1 / span 3;
		@apply grid relative justify-items-center content-center w-full bg-white shadow-grey gap-5;
	}

	img {
		width: 300px;
		height: 300px;
    animation: spin 4s linear infinite;
		@apply rounded-full;
	}

	h1 {
		@apply text-5xl;
	}

	form {
		@apply grid justify-items-center items-center w-full gap-5;
	}

	.sign div {
    padding: 18px;
    box-shadow: 0 0 0 2px #928a1a;
    background-color: #f2f8a1;
    color: #727010;
    @apply w-max rounded text-center font-bold;
  }

	.accept, .change {
		width: 200px;
		@apply py-3.5 rounded-sm bg-black shadow-black text-center font-bold text-white cursor-pointer;
	}

	.change {
		@apply bg-white text-blue shadow-blue;
	}

	@keyframes spin { 
    100% { 
      transform: rotate(360deg); 
  	}
	}
</style>
