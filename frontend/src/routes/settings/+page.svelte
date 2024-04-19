<script lang="ts">
	import type { IErrorsProps, IKeys, SettingsData } from "$lib/types/global";
	import { goto } from "$app/navigation";
	import jsCookie from 'js-cookie';
	import validator from 'validator';
  import axios from "$lib/axios";
  import { Box as ErrorBox, EditChat, OptionBox as Box } from "$lib/components";
  import { listItems, SettingsText } from "$lib/dictionary";
  import {
		addId,
		changeName,
		isDisabledButton,
		loadImage,
		setSettingsProps
	} from "$lib/services";
  import { socket } from "$lib/socket";
	import { user, options, register, contacts } from '$lib/store';
	import { Method, Option, Settings } from "$lib/types/enums";

	let settingsProps = setSettingsProps($user);
	let disabledButton = isDisabledButton($user);
	let passwordValue: IKeys<string> = { old: '', new: '', confirm: '' };
	let errorsProps: IErrorsProps = { success: false, message: '' };
	let visible = false;

	async function checkOldPassword() {
		const options = {
			method: Method.POST,
			url: '/auth/password',
			data: { password: passwordValue.old }
		};

		settingsProps.password.old = passwordValue.old.length >= 8 &&
			await axios(options)
				.then(res => res.data)
				.catch(() => false);
	}

	function checkNewPassword() {
		settingsProps.password.new = validator.isStrongPassword(passwordValue.new) &&
			validator.isLength(passwordValue.new, { max: 40 });
	}

	function checkConfirmPassword() {
		settingsProps.password.confirm = passwordValue.confirm === passwordValue.new;
	}
	
	async function handleDrop(e: DragEvent) {
		if (e.dataTransfer) {
			settingsProps.avatar = await loadImage(e.dataTransfer.files[0]);
			e.dataTransfer.items.clear();
		}
	}

	async function handleImage(this: HTMLInputElement) {
		if (this.files) settingsProps.avatar = await loadImage(this.files[0]);
	}
	
	async function handleDelete() {
		socket.emit('emitDestroyUser');
		
		const data: { delete: false } = await axios({
			method: Method.DELETE,
			url: '/settings/deleteUser'
		}).then(res => res.data)
			.catch(err => {
				console.log(err?.message);
				return { delete: false };
			});

		options.setOption(Option.SETTINGS);

		if (data.delete) {
			axios.defaults.headers.common['Authorization'] = '';
			
			jsCookie.remove('authenticate');
			socket.disconnect();
			register.resetOptions();
			user.resetUser();
			contacts.resetContacts();
			goto('/register');
			setTimeout(() => register.setOption(Option.REGISTER), 3000);
		}
	}

	async function handleSubmit(this: HTMLFormElement) {
		const data: SettingsData = await axios({
			method: this.method,
			url: this.action.replace(location.origin, ''),
			data: this
		}).then(res => res.data)
			.catch(err => err.response?.data ?? { success: false, message: 'Network Error' });

		if (!data.success) errorsProps = data;

		if (data.success) {
			passwordValue = { old: '', new: '', confirm: '' };
			errorsProps = data;

			if (this.id === Settings.AVATAR) user.updateAvatar(data.filename);

			if (this.id === Settings.USERNAME) user.updateUsername(settingsProps.username);

			if (this.id === Settings.DESCRIPTION) {
				user.changeDescription(settingsProps.description);
			}

			if (this.id === Settings.UNBLOCK) {
				user.unblockContact(settingsProps.unblock);
				socket.emit('emitUnblock', settingsProps.unblock);
			}

			if (this.id !== Settings.DELETE) {
				settingsProps = setSettingsProps($user);
				disabledButton = isDisabledButton($user);
			}
		}

		visible = true;
		setTimeout(() => visible = false, 5000);
	}
</script>

{#if $options.settings}
	<EditChat on:click={handleDelete}>
		<h2 class="title">
			Are you sure you want to delete this user?
		</h2>
	</EditChat>
{/if}

{#if visible}
	<ErrorBox success={errorsProps.success} message={errorsProps.message} />
{/if}

<div class="container-box">
	<button class="close" on:click={() => goto('/')}>
		<i class="fa-solid fa-xmark"></i>
	</button>
	<h1>
		Settings
	</h1>
	{#each Object.values(Settings) as key}
		<form
			id={key}
			class:occult={key === Settings.PASSWORD && $user.type !== 'Email'}
			action={'/settings/' + key}
			method={key !== Settings.DELETE ? Method.POST : Method.DELETE}
			on:submit|preventDefault={key !== Settings.DELETE ? handleSubmit : () => options.setOption(Option.SETTINGS)}
		>
			<label for={key}>
				{SettingsText[key]}:
			</label>
			{#if key === Settings.AVATAR}
				<label
					class="center"
					on:dragenter|preventDefault={() => {}}
					on:drop|preventDefault={handleDrop}
					on:dragover|preventDefault={() => {}}
				>
					<img src={settingsProps.avatar} alt={$user.username}>
					<input type="file" name="avatar" on:change={handleImage}>
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
				<input
					type="password"
					name="actPassword"
					placeholder="Enter the actual password"
					bind:value={passwordValue.old}
					on:keyup={checkOldPassword}
				>
				<input
					type="password"
					name="newPassword"
					placeholder="Enter the new password"
					bind:value={passwordValue.new}
					on:keyup={checkNewPassword}
				>
				{#if settingsProps.password.new}
					<input
						type="password"
						name="confirmPassword"
						placeholder="Confirm the password"
						bind:value={passwordValue.confirm}
						on:keyup={checkConfirmPassword}
					>
				{/if}
			{:else if key === Settings.UNBLOCK}
				<ul>
					{#each listItems as { key, name, text }}
						{#if $user.blocked && $user.blocked[key].length}
							<p>{changeName(key)}:</p>
							{#each $user.blocked[key] as member (member.id)}
								<Box
									{member}
									{name}
									on:click={() => settingsProps.unblock[key] = addId(member, settingsProps.unblock[key])}
								/>
							{/each}
						{:else}
							<li>You haven't blocked any {text} yet! :D</li>
						{/if}
						{#if key === 'users'}
							<span></span>
						{/if}
					{/each}
				</ul>
			{/if}
			{#if key !== Settings.UNBLOCK ||
				$user.blocked?.users.length ||
				$user.blocked?.groups.length}
				<button
					class:accept={key !== Settings.DELETE}
					class:delete={key === Settings.DELETE}
					disabled={!disabledButton[key](settingsProps[key])}
				>{key === Settings.DELETE ? 'Delete' : 'Accept'}</button>
			{/if}
		</form>
	{/each}
</div>

<style lang="postcss">
	h1 {
		@apply font-medium text-[56px];
	}

	form {
		@apply grid w-3/5 min-w-[280px] gap-3 [&_label]:font-semibold;

		&.occult {
			@apply hidden;
		}

		& .center {
			@apply justify-self-center w-min h-min;
		}

		& .accept {
			@apply justify-self-end py-2 px-6 bg-[#25915b] rounded-2xl text-[20px] font-bold text-white;

			&[disabled] {
				@apply bg-[#dadada] text-[#2a2a2a] cursor-default;
			}
		}

		& .delete {
			@apply justify-self-center w-min py-3 px-12 bg-[#d32b2b] rounded-3xl text-[24px] font-bold text-white;
		}
	}

	img {
		box-shadow: 0 0 4px #999999;
		@apply flex-none w-full min-w-[280px] h-[280px] rounded-full object-cover object-center;
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
		@apply flex items-center w-full text-center text-xl font-medium leading-snug;
	}

	span {
		@apply w-full h-0.5 my-1.5 bg-black;
	}
</style>
