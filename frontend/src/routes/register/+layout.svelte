<script lang="ts">
	import type { ResponseData } from '$lib/types/global';
  import { beforeNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
	import jsCookie from 'js-cookie';
	import axios from '$lib/axios';
  import { GITHUB_ACCESS } from '$lib/config';
  import { emailInput, passInput, register } from '$lib/store';
	import { changeName, connectSocket } from '$lib/services/libs';
  import { Method, Option, PathIcon } from '$lib/types/enums';

	let visible = false;

	async function handleSubmit(this: HTMLFormElement) {
		visible = false;

		if (
			!$emailInput.check($emailInput.value) && !$passInput.check($passInput.value)
		) {
			const data: ResponseData = await axios({
				method: this.method,
				url: this.action.replace(location.origin, ''),
				data: this
			}).then(res => res.data)
				.catch(err => err.response ? err.response.data : visible = true);

			if (data.user) {
				connectSocket(data.user, data.token);
			} else if (data.errors) {
				const { username, password } = data.errors;

				if (username) emailInput.updateError(username);
				if (password) passInput.updateError(password);
			} else if (data.error) console.log(data.error);
		}
	}

	onMount(async () => {
		const token = jsCookie.get('authenticate');
		const queryString = location.search;
		const urlParams = new URLSearchParams(queryString);
		const codeParam = urlParams.get('code');

		if (codeParam && !token) {
			register.resetOptions();
			const data: ResponseData = await axios({ url: '/auth/getAccessToken?code=' + codeParam })
				.then(res => res.data)
				.catch(err => {
					console.error(err?.message);
					return null;
				});

			if (data?.user) connectSocket(data.user, data.token);
		}
	});

	beforeNavigate(() => {
		emailInput.resetInput();
		passInput.resetInput();
	});
</script>

<div class="sign">
  <h1>
		{changeName(Option.REGISTER)}
	</h1>
	<form
		action='/auth/{Option.REGISTER}'
		method={Method.POST}
		on:submit|preventDefault={handleSubmit}
	>
		{#if visible}
			<div>
				An error occurred while trying to connect to the server
			</div>
		{/if}
		<slot />
		<button>
			{changeName(Option.REGISTER)}
		</button>
	</form>
	<span></span>
	<a href={GITHUB_ACCESS}>
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d={PathIcon.GITHUB} />
		</svg>
		Github
	</a>
</div>

<style lang="postcss">
	.sign {
		grid-auto-rows: min-content;
		grid-column: 1 / span 2;
		grid-row: 1 / span 3;
		@apply grid relative justify-items-center content-center w-full py-5 bg-white gap-5 [&_h1]:text-[56px];

		& div {
			box-shadow: 0 0 0 2px #928a1a;
			@apply w-max p-[18px] bg-[#f2f8a1] rounded text-center font-bold text-[#727010];
		}
	}

	form {
		@apply grid justify-items-center items-center w-full gap-5;

		& button {
			box-shadow: 0 0 0 2px #1a6fcf;
			@apply bg-white text-[#1a6fcf];
		}
	}

	span {
		@apply w-1/2 min-w-[300px] max-w-[600px] h-0.5 bg-black;
	}

	a, button {
		box-shadow: 0 0 0 2px #000000;
		@apply flex justify-center w-[200px] py-3 bg-black rounded-sm font-bold text-white leading-tight gap-2;
	}

	a > svg {
		@apply w-5 h-5 fill-white;
	}
</style>
