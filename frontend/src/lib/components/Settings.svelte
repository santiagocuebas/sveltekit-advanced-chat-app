<script lang="ts">
	import type { IKeys, SettingsData } from "$lib/types/global";
  import axios from "axios";
	import validator from 'validator';
	import { DIR } from "$lib/config";
  import { listItems, SettingsText } from "$lib/dictionary";
  import { socket } from "$lib/socket";
  import {
		addId,
		changeName,
		getData,
		isDisabled,
		initSettingsProps
	} from "$lib/services/libs";
  import { user, options, switchs, users, groups, register } from '$lib/store';
	import { Formats, Option, Settings } from "$lib/types/enums";
  import Edit from "$lib/components/EditChat.svelte";
  import ErrorBox from "./Box.svelte";
  import Box from "./OptionBox.svelte";
	
	const data = getData([isValidOldPassword, isValidPassword, isCorrectPassword]);
	let settingsProps = initSettingsProps($user);
	let visible = false;
	let src = DIR + '/uploads/avatar/' + $user.avatar;
	let password: string;
	let className: string;
	let message: string | IKeys<string>;

	async function handleAvatar(this: HTMLInputElement) {
		const fileReader = new FileReader();
		const validFormats: string[] = Object.values(Formats);
		const files = this.files;

		fileReader.addEventListener('load', ({ target }) => {
			src = target?.result as string;
			settingsProps.avatar = target?.result as string;
		});

		if (files && files[0].size <= 512000 && validFormats.includes(files[0].type)) {
			fileReader.readAsDataURL(files[0]);
		}
	}

	async function isValidOldPassword(this: HTMLInputElement) {
		if (validator.isStrongPassword(this.value)) {
			const data = await axios({
				method: 'POST',
				url: DIR + '/api/home/password',
				data: { password: this.value },
				withCredentials: true
			}).then(res => res.data)
				.catch(() => {
					return { match: false };
				});

			settingsProps.password.match = data.match;
		} else settingsProps.password.match = false;
	}

	function isValidPassword(this: HTMLInputElement) {
		password = this.value;

		if (
			validator.isStrongPassword(password) &&
			validator.isLength(password, { max: 40 })
		) settingsProps.password.new = true;
		else settingsProps.password.new = false;
	}

	function isCorrectPassword(this: HTMLInputElement) {
		if (this.value === password) settingsProps.password.confirm = true;
		else settingsProps.password.confirm = false;
	}
	
	async function handleDelete() {
		socket.emit('emitDestroyUser');
		
		const data = await axios({
			method: 'DELETE',
			url: DIR + '/api/settings/deleteUser',
			withCredentials: true
		}).then(res => res.data);

		$options.settings = false;

		if (data.delete) {
			socket.disconnect();
			user.resetUser();
			users.resetContacts();
			groups.resetContacts();
			switchs.resetOptions();
			register.setOption(Option.SIGNIN);
		}
	}

	async function handleSubmit(this: HTMLFormElement) {
		const data: SettingsData = await axios({
			method: this.method,
			url: this.action,
			data: this,
			withCredentials: true
		}).then(res => res.data)
			.catch(err => err.response?.data);

		if (data.errors) {
			className = data.errors;
			message = data.message;
		}

		if (data.success) {
			className = data.success;
			message = data.message;
			if (data.filename) settingsProps.avatar = data.filename;

			if (this.id !== Settings.PASSWORD && this.id !== Settings.DELETE) {
				user.updateProp(this.id, settingsProps[this.id] as never);
			}

			if (this.id === Settings.UNBLOCK) {
				socket.emit('emitUnblock', settingsProps.unblock);
			}

			if (this.id !== Settings.DESCRIPTION && this.id !== Settings.DELETE) {
				settingsProps = settingsProps.resetProps(this.id);
			}

		 	visible = true;
		}
	}
</script>

{#if $options.settings}
	<Edit handle={handleDelete}>
		<h2 class="title">Are you sure you want to delete this user?</h2>
	</Edit>
{/if}

{#if visible}
	<ErrorBox bind:visible={visible} {className} {message} />
{/if}

<div class="container-box">
	<button class="close" on:click={() => switchs.resetOptions()}>
		<i class="fa-solid fa-xmark"></i>
	</button>
	<h1>Settings</h1>
	{#each Object.values(Settings) as key}
		<form
			id={key}
			action={DIR + '/api/settings/' + key}
			method={key !== Settings.DELETE ? 'POST' : 'DELETE'}
			on:submit|preventDefault={key !== Settings.DELETE ? handleSubmit : () => options.setOption(Option.SETTINGS)}
		>
			<label for={key}>
				{SettingsText[key]}:
			</label>
			{#if key === Settings.AVATAR}
				<label class="center">
					<img src={src} alt={$user.username}>
					<input type="file" name="avatar" on:change={handleAvatar}>
				</label>
			{:else if key === Settings.USERNAME}
				<input
					type="text"
					name="username"
					placeholder={$user.username}
					bind:value={settingsProps.username}
				>
			{:else if key === Settings.DESCRIPTION}
				<textarea
					name="description"
					bind:value={settingsProps.description}
					spellcheck="false"
					rows="5"
				></textarea>
			{:else if key === Settings.PASSWORD}
				{#each data as { name, text, key }}
					{#if name !== 'confirmPassword' || settingsProps.password.new}
						<input type="password" name={name} on:keyup={key} placeholder={text}>
					{/if}
				{/each}
			{:else if key === Settings.UNBLOCK}
				{#each listItems as { key, name, text }}
					<ul>
						{#if $user.blocked[key].length}
							<p>{changeName(key)}:</p>
							{#each $user.blocked[key] as member (member.id)}
								<Box
									bind:prop={settingsProps.unblock[key]}
									{name}
									{member}
									change={addId}
								/>
							{/each}
						{:else}
							<li class="message">You haven't blocked any {text} yet! :D</li>
						{/if}
					</ul>
				{/each}
			{:else}
				<button class="delete">
					Delete
				</button>
			{/if}
			{#if key !== Settings.DELETE && (key !== Settings.UNBLOCK || ($user.blocked.users.length || $user.blocked.groups.length))}
				<button class='accept' disabled={!isDisabled($user)[key](settingsProps)}>
					Accept
				</button>
			{/if}
		</form>
	{/each}
</div>

<style lang="postcss">
	h1 {
		font-size: 56px;
	}

	form {
		min-width: 280px;
		@apply grid w-3/5 gap-3;
	}

	label {
		@apply font-semibold;
	}

	.center {
		@apply justify-self-center w-min h-min;
	}

	img {
		height: 280px;
		min-width: 280px;
		min-height: 280px;
		box-shadow: 0 0 0 1px #999999;
		@apply w-full rounded-full object-cover object-center;
	}

	input, textarea, ul {
		box-shadow: 0 0 0 1px #999999;
		scrollbar-width: none;
		@apply p-2.5 rounded-lg;
	}

	ul {
		@apply flex flex-wrap justify-between;
	}

	p {
		@apply w-full font-medium leading-tight;
	}

	li {
		@apply flex items-center w-full;
	}

	.message {
		@apply p-1.5 text-center text-xl font-medium leading-none;
	}

	.accept {
		background-color: #25915b;
		color: #ffffff;
		@apply justify-self-end py-2 px-6 rounded-2xl text-xl font-bold leading-none cursor-pointer;
	}

	.accept[disabled] {
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
