<script lang="ts">
	import type { ILoaded, IError } from "$lib/global";
  import axios from "axios";
  import { userData, switchs } from '$lib/store';
	import { DIR } from "$lib/config";
  import { isLoaded } from "$lib/function";
	import { loadImage } from "$lib/services/handle-image.js";
  import EditChat from "./EditChat.svelte";
	
	let user = userData.getUser();
	let disabled = true;
	let src = DIR + '/uploads/avatar/' + user.avatar;
	let username = '';
	let description = user.description;
	let actPassword = '';
	let newPassword = '';
	let confirmPassword = '';
	let listUser: string[] = [];
	let visibleBox = false;

	async function handleAvatar(this: HTMLInputElement) {
		const files = this.files as FileList;
		
		const data: ILoaded | IError = await loadImage(files[0])
			.then((res: any) => res)
			.catch(err => err);

		if (isLoaded(data)) {
			src = data.image;
			disabled = data.enabled;
		} else {
			console.log(data);
		}		
	}

	function addId(this: HTMLInputElement) {
		if (this.checked) return listUser = [this.value, ...listUser];
		return listUser.filter(id => id !== this.value);
	}

	async function handleDelete() {
		const data = await axios({
			method: 'POST',
			url: DIR + '/api/main/test',
			withCredentials: true
		}).then(res => res.data);

		visibleBox = false;

		console.log(data);
	}

	async function handleSubmit(this: HTMLFormElement) {
		const data = await axios({
			method: this.method,
			url: DIR + '/api/main/test',
			data: this,
			withCredentials: true
		}).then(res => res.data);

		console.log(data);
	}
</script>

{#if visibleBox}
	<EditChat bind:visible={visibleBox} handle={handleDelete}>
		<h2>Are you sure you want to delete this user?</h2>
	</EditChat>
{/if}

<div class="settings">
	<button class="close" on:click|preventDefault={() => switchs.resetOptions()}>
		<i class="fa-solid fa-xmark"></i>
	</button>
	<h1>Settings</h1>
	<form 
		action={DIR + '/api/settings/avatar'}
		method='POST'
		on:submit|preventDefault={handleSubmit}
	>
		<div class="box">
			Change avatar:
		</div>
		<label class="center">
			<img src={src} alt={user.username}>
			<input type="file" name="avatar" on:change={handleAvatar}>
		</label>
		<button class={disabled ? 'disabled' : 'accept'} disabled={disabled}>
			Accept
		</button>
	</form>
	<form 
		action={DIR + '/api/settings/username'}
		method='POST'
		on:submit|preventDefault={handleSubmit}
	>
		<label for="username">
			Change username:
		</label>
		<input
			type="text"
			name="username"
			placeholder={user.username}
			bind:value={username}
		>
		<button
			class={username.length < 3 ? 'disabled' : 'accept'}
			disabled={username.length < 3}
		>Accept</button>
	</form>
	<form 
		action={DIR + '/api/settings/description'}
		method='POST'
		on:submit|preventDefault={handleSubmit}
	>
		<label for="description">
			Change description:
		</label>
		<textarea
			name="description"
			bind:value={description}
			spellcheck="false"
			rows="5"
		></textarea>
		<button
			class={description === user.description ? 'disabled' : 'accept'}
			disabled={description === user.description}
		>Accept</button>
	</form>
	<form 
		action={DIR + '/api/settings/password'}
		method='POST'
		on:submit|preventDefault={handleSubmit}
	>
		<label for="newPassword">
			Change password:
		</label>
		<input
			type="password"
			name="actPassword"
			bind:value={actPassword}
			placeholder="Enter the actual password"
		>
		<input
			type="password"
			name="newPassword"
			bind:value={newPassword}
			placeholder="Enter the new password"
		>
		{#if actPassword.length >= 8 && newPassword.length >= 8}
			<input
				type="password"
				name="confirmPassword"
				bind:value={confirmPassword}
				placeholder="Confirm the password"
			>
		{/if}
		<button
			class={(actPassword.length < 8 || newPassword.length < 8 || newPassword !== confirmPassword) ? 'disabled' : 'accept'}
			disabled={actPassword.length < 8 || newPassword.length < 8 || newPassword !== confirmPassword}
		>Accept</button>
	</form>
	<form 
		action={DIR + '/api/settings/unblockUsers'}
		method='POST'
		on:submit|preventDefault={handleSubmit}
	>
		<label for="unblock">
			Unblock user:
		</label>
		<ul>
			{#if user.blacklist.length}
				{#each user.blacklist as { id, name } ({ id })}
					<li>
						{name}
						<input
							type="checkbox"
							name="unblock"
							value={id}
							on:click={addId}
						>
					</li>
				{/each}
				{:else}
				<li class="message">
					You haven't blocked anyone yet! :D
				</li>
			{/if}
		</ul>
		{#if user.blacklist.length}
			<button
			class={listUser.length ? 'disabled' : 'accept'}
			disabled={listUser.length}
			>Accept</button>
		{/if}
	</form>
	<form 
		action={DIR + '/api/settings/deleteUser'}
		method='DELETE'
	>
		<label for="delete">
			Delete user:
		</label>
		<button class="delete" on:click|preventDefault={() => visibleBox = true}>
			Delete
		</button>
	</form>
</div>

<style lang="postcss">
	h2 {
		@apply text-xl font-semibold text-center leading-none;
	}

	.settings {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		background-color: #ffffff;
		scrollbar-width: none;
		z-index: 200;
		@apply grid relative content-start justify-items-center py-10 px-2.5 overflow-y-scroll gap-5;
	}

	.close {
		margin-top: -30px;
		@apply justify-self-end flex fixed items-center justify-center w-9 h-9 font-bold leading-none;
	}

	.close i {
		color: #b2b2b2;
		@apply text-4xl font-bold leading-none cursor-pointer;
	}

	.close i:hover {
		color: #a3a3a3;
	}

	h1 {
		font-size: 56px;
	}

	form {
		min-width: 280px;
		@apply grid w-3/5 gap-3;
	}

	label, .box {
		@apply font-semibold;
	}

	.center {
		@apply justify-self-center;
	}

	input[type='file'] {
		@apply hidden;
	}

	img {
		width: 280px;
		height: 280px;
		box-shadow: 0 0 0 1px #999999;
		@apply justify-self-center rounded-full object-cover object-center;
	}

	input, textarea, ul {
		box-shadow: 0 0 0 1px #999999;
		scrollbar-width: none;
		@apply p-2.5 rounded-lg;
	}

	ul {
		@apply flex flex-wrap gap-1.5;
	}

	li {
		@apply flex items-center w-full;
	}

	.message {
		@apply p-1.5 text-center text-xl font-medium leading-none;
	}

	input[type='checkbox'] {
		@apply ml-auto;
	}

	.accept, .disabled {
		background-color: #25915b;
		color: #ffffff;
		@apply justify-self-end py-2 px-6 rounded-2xl text-xl font-bold leading-none cursor-pointer;
	}

	.disabled {
		background-color: #dadada;
		color: #2a2a2a;
		@apply cursor-default;
	}

	.delete {
		background-color: #d32b2b;
		color: #ffffff;
		@apply justify-self-center w-min py-3 px-12 rounded-3xl text-2xl font-bold leading-none cursor-pointer;
	}
</style>