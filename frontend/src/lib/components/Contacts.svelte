<script lang="ts">
  import axios from 'axios';
  import type { IUser } from '$lib/global';
	import { DIR } from '$lib/config.js';

  export let contacts: IUser[];
	export let contact: IUser;

	async function searchUser(this: HTMLFormElement) {
		const data = await axios({
			method: this.method,
			url: this.action,
			withCredentials: true,
			data: this
		}).then(res => res.data);

		console.log(data)

		contacts = data.contacts;
	}
</script>

<div>
	<form
		action={DIR + '/api/search'}
		method="POST"
		on:submit|preventDefault={searchUser}
	>
		<button>
			<i class="fa-solid fa-search"></i>
		</button>
		<input type="text" name="search" placeholder="Search a chat">
	</form>
	<ul>
		{#if contacts.length > 0}
			{#each contacts as user}
				<li on:mousedown={() => contact = user}>
					<img src={DIR + '/uploads/avatar/' + user?.avatar} alt={user?._id}>
					<p title={user?.username}>{user?.username}</p>
				</li>
			{/each}
		{/if}
	</ul>
</div>

<style lang="postcss">
  div {
		background-color: #ffffff;
		z-index: 51;
		@apply flex relative flex-wrap w-full h-full content-start;
	}

	form {
		@apply flex w-full h-min;
	}

	button {
		padding: 10px 30px;
		cursor: pointer;
	}

	input {
		@apply w-full;
	}

	i {
		color: #666666;
		@apply text-xl leading-none;
	}

	ul {
		@apply grid w-full;
	}

	li {
		grid-template-columns: min-content 1fr;
		@apply grid items-center w-full p-3 font-medium gap-3;
	}

	li:hover {
		background-color: #e7e7e7;
	}

	img {
		@apply w-16 h-16;
	}
</style>
