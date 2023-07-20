<script lang="ts">
	import type { IKeys } from '$lib/global';
	import axios from 'axios';
	import {
		isValidInput,
		isValidLength
	} from '$lib/services/validation-submit.js';

	export let action: string;
	export let inputs: IKeys<string>;
	export let set: (key: string, message: string) => void;
	export let visible: boolean;

	async function handleSubmit(this: HTMLFormElement) {
		visible = false;
		try {
			if (isValidLength(inputs) && isValidInput(inputs)) {
				const data = await axios({
					method: this.method,
					url: this.action,
					withCredentials: true,
					data: this
				}).then(res => res.data);

				if (data.logged) window.location.href = '/';
				
				if (data.error) {
					console.log(data.error)
				}

				if (data.errors) {
					for (const error of Object.keys(data.errors)) {
						if (data.errors[error]) {
							return set(error, data.errors[error]);
						}
					}
				}
			}
		} catch {
			visible = true;
		}
	}
</script>

<form
	action={action}
	method='POST'
	on:submit|preventDefault={handleSubmit}
>
	<slot />
</form>

<style lang="postcss">
	form {
		@apply grid justify-items-center items-center w-full gap-5;
	}
</style>
