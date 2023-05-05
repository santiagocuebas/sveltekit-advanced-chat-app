<script lang="ts">
	import axios from 'axios';

	export let logged: boolean;

	async function handleSubmit(this: HTMLFormElement) {
		const data = await axios({
			method: this.method,
			url: this.action,
			withCredentials: true,
			data: this
		}).then(res => res.data);

		console.log(logged);
		console.log(data);
	}
</script>

<form
	action="http://localhost:4200/api/auth/register"
	method='POST'
	on:submit={handleSubmit}
>
	<h1 class="underline">Register</h1>
	<input type="email" name="email" placeholder="Email">
	<input type="password" name="password" placeholder="Password">
	<button>
		Signin
	</button>
</form>

<style lang="postcss">
	form {
		min-width: 450px;
		max-width: 600px;
		@apply grid w-3/5 mt-32 p-5 rounded-2xl shadow-grey bg-white gap-y-3;
	}

	h1 {
		@apply justify-self-center text-4xl;
	}

	input {
		outline: 1px solid #aaaaaa;
		@apply p-3.5 rounded-md;
	}

	input:focus {
		outline: 2px solid #4b94e7;
	}

	button {
		padding: 10px 20px;
		@apply justify-self-end rounded-md bg-blue text-xl font-bold text-white cursor-pointer;
	}
</style>
