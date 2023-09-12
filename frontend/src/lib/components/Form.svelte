<script lang="ts">
	import type { IKeys, ResponseData } from '$lib/types/global';
	import axios from 'axios';
	import { isValidInput, isValidLength } from '$lib/services/validation-submit';
  import { socket } from '$lib/socket';
  import {
		user,
		register,
		valueInput,
		activeError,
		errorMessage
	} from '$lib/store';

	export let action: string;
	export let visible: boolean;

	async function handleSubmit(this: HTMLFormElement) {
		visible = false;

		try {
			if (
				isValidLength($valueInput as IKeys<string>) &&
				isValidInput($valueInput as IKeys<string>)
			) {
				const data: ResponseData = await axios({
						method: this.method,
						url: this.action,
						withCredentials: true,
						data: this
					}).then(res => res.data)
						.catch(err => err);

				if (data.user) {
					user.setUser(data.user);
					socket.auth = { sessionID: $user.id };
					socket.connect();
					register.setOption('user');
				} else if (data.errors) {
					for (const error of Object.keys(data.errors)) {
						if (data.errors[error]) {
							activeError.setOption(error, true);
							errorMessage.setOption(error, data.errors[error]);
						}
					}
				} else if (data.error) console.log(data.error);
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
><slot /></form>

<style lang="postcss">
	form {
		@apply grid justify-items-center items-center w-full gap-5;
	}
</style>
