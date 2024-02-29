<script lang="ts">
	import type { IKeys, SettingsData } from "$lib/types/global";
	import { goto } from "$app/navigation";
	import jsCookie from 'js-cookie';
	import validator from 'validator';
  import { Box as ErrorBox, EditChat } from "$lib/components";
  import axios from "$lib/axios";
  import { listItems, SettingsText } from "$lib/dictionary";
  import { socket } from "$lib/socket";
	import { user, options, users, groups, register } from '$lib/store';
  import {
		addId,
		changeName,
		getData,
		isDisabled,
		setSettingsProps
	} from "$lib/services/libs";
	import { Formats, Method, Option, Settings } from "$lib/types/enums";
	
	const data = getData([isValidOldPassword, isValidPassword, isCorrectPassword]);
	let settingsProps = setSettingsProps($user.avatar, $user.description);
	let visible = false;
	let password: string;
	let success: boolean;
	let errors: boolean;
	let message: string | IKeys<string>;

	async function handleAvatar(this: HTMLInputElement) {
		const fileReader = new FileReader();
		const validFormats: string[] = Object.values(Formats);
		const files = this.files;

		fileReader.addEventListener('load', ({ target }) => {
			settingsProps.avatar = target?.result as string;
		});

		if (files && files[0].size <= 512000 && validFormats.includes(files[0].type)) {
			fileReader.readAsDataURL(files[0]);
		}
	}

	async function isValidOldPassword(this: HTMLInputElement) {
		if (validator.isStrongPassword(this.value)) {
			const data = await axios({
				method: Method.POST,
				url: '/home/password',
				data: { password: this.value }
			}).then(res => res.data)
				.catch(() => {
					return { match: false };
				});

			settingsProps.password.match = data.match;
		} else settingsProps.password.match = false;
	}

	function isValidPassword(this: HTMLInputElement) {
		settingsProps.password.new = (
			validator.isStrongPassword(this.value) &&
			validator.isLength(this.value, { max: 40 })
		) ? true : false;
	}

	function isCorrectPassword(this: HTMLInputElement) {
		settingsProps.password.confirm = (this.value === password) ? true : false;
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
			users.resetContacts();
			groups.resetContacts();
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
			.catch(err => err.response?.data);

		if (data.errors) {
			errors = data.errors;
			message = data.message;
		}

		if (data.success) {
			success = data.success;
			message = data.message;

			if (this.id === Settings.AVATAR && data.filename) {
				user.updateAvatar(data.filename);
			}

			if (this.id === Settings.USERNAME) {
				user.updateUsername(settingsProps.username);
			}

			if (this.id === Settings.UNBLOCK) {
				user.unblockContacts(settingsProps.unblock);
				socket.emit('emitUnblock', settingsProps.unblock);
			}

			if (this.id !== Settings.DESCRIPTION && this.id !== Settings.DELETE) {
				settingsProps = setSettingsProps($user.avatar, settingsProps.description);
			}
		}

		visible = true;
		setTimeout(() => visible = false, 5000);
	}
</script>

{#if $options.settings}
	<EditChat handle={handleDelete}>
		<h2 class="title">
			Are you sure you want to delete this user?
		</h2>
	</EditChat>
{/if}

{#if visible}
	<ErrorBox {success} {errors} {message} />
{/if}

<div class="container-box">
	<button class="close" on:click={() => goto('/')}>
		<i class="fa-solid fa-xmark"></i>
	</button>
	<h1>Settings</h1>
	{#each Object.values(Settings) as key}
		<form
			id={key}
			action={'/settings/' + key}
			method={key !== Settings.DELETE ? Method.POST : Method.DELETE}
			on:submit|preventDefault={key !== Settings.DELETE ? handleSubmit : () => options.setOption(Option.SETTINGS)}
		>
			<label for={key}>
				{SettingsText[key]}:
			</label>
			{#if key === Settings.AVATAR}
				<label class="center">
					<img src={settingsProps.avatar} alt={$user.username}>
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
				<ul>
					{#each listItems as { key, name, text }}
						{#if $user.blocked[key].length}
							<p>{changeName(key)}:</p>
							{#each $user.blocked[key] as member (member.id)}
								<li class="checkbox">
									{member.name}
									<input
										type="checkbox"
										name={name}
										value={member.id}
										on:click={() => settingsProps.unblock[key] = addId(member, settingsProps.unblock[key])}
									>
								</li>
							{/each}
						{:else}
							<li class="no-blocked">
								You haven't blocked any {text} yet! :D
							</li>
						{/if}
						{#if key === 'users'}
							<span></span>
						{/if}
					{/each}
				</ul>
			{:else}
				<button class="delete">
					Delete
				</button>
			{/if}
			{#if key !== Settings.DELETE && (key !== Settings.UNBLOCK || ($user.blocked.users.length || $user.blocked.groups.length))}
				<button
					class='accept'
					disabled={!isDisabled($user.avatar, $user.description)[key](settingsProps)}
				>Accept</button>
			{/if}
		</form>
	{/each}
</div>

<style lang="postcss">
	h1 {
		@apply text-[56px];
	}

	form {
		@apply grid w-3/5 min-w-[280px] gap-3 [&_label]:font-semibold;

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
		@apply flex relative flex-none items-center w-[48%];

		&.checkbox {
			@apply text-center text-xl font-medium leading-snug;
		}

		&.no-blocked {
			@apply w-full h-min max-h-5 overflow-hidden text-ellipsis leading-tight;
		}
	}

	input[type='checkbox'] {
		@apply absolute self-center right-0;
	}

	span {
		@apply w-full h-0.5 bg-black;
	}
</style>
