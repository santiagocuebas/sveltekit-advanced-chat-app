<script lang="ts">
	import type { IKeys, ResponseData } from '$lib/types/global';
	import { onDestroy, onMount } from 'svelte';
	import { Input } from './index';
	import axios from '$lib/axios';
  import { avatarURL } from '$lib/dictionary';
  import { socket } from '$lib/socket';
  import {
		user,
		register,
		valueInput,
		errorMessage,
		activeError
	} from '$lib/store';
	import { changeName, setType } from '$lib/services/libs';
	import { checks } from '$lib/services/validations';
	import { isValidInput, isValidLength } from '$lib/services/validation-submit';
  import { Inputs, Method, Option } from '$lib/types/enums';

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
				url: this.action.replace(location.origin, ''),
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
		<picture>
			<img src="/images.svg" alt="title">
		</picture>
	{/if}
  <h1>{changeName(title)}</h1>
  {#if inputs !== undefined}
		<form
			action={avatarURL[title]}
			method={Method.POST}
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
			<button>
				{changeName(title)}
			</button>
		</form>
		<button on:click={() => register.setOption(option)}>
			{option === Option.REGISTER ? 'Create Account' : 'Sign In'}
		</button>
	{/if}
</div>

<style lang="postcss">
	.sign {
		grid-auto-rows: min-content;
		grid-column: 1 / span 2;
		grid-row: 1 / span 3;
		box-shadow: 0 0 10px #888888;
		@apply grid relative justify-items-center content-center w-full bg-white gap-5;

		& div {
			box-shadow: 0 0 0 2px #928a1a;
			@apply w-max p-[18px] bg-[#f2f8a1] rounded text-center font-bold text-[#727010];
		}
	}

	picture {
		@apply w-[300px] h-[300px];
	}

	img {
    animation: spin 4s linear infinite;
		@apply w-full h-full rounded-full;
	}

	h1 {
		@apply text-5xl;
	}

	form {
		@apply grid justify-items-center items-center w-full gap-5;

		& button {
			box-shadow: 0 0 0 2px #000000;
			@apply bg-black text-white;
		}
	}

	button {
		box-shadow: 0 0 0 2px #4b94e7;
		@apply w-[200px] py-3.5 bg-white rounded-sm text-center font-bold text-[#4b94e7];
	}

	@keyframes spin { 
    100% { 
      transform: rotate(360deg); 
  	}
	}
</style>
