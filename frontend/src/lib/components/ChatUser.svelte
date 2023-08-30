<script lang="ts">
	import type {
		IChat,
		IContact,
		IKeys,
		Members
	} from "$lib/global";
  import { afterUpdate, onMount } from "svelte";
  import axios from "axios";
	import validator from 'validator';
	import { format } from 'timeago.js';
	import { DIR } from "$lib/config";
  import {
		OptionUser,
		OptionMember,
		OptionMod,
		OptionAdmin
	} from "$lib/dictionary";
  import {
		UserOptions,
		MemberOptions,
		ModOptions,
		AdminOptions,
		TypeContact,
    StateOption
	} from "$lib/enums";
  import { getChat, isMember, isMod, selectAvatarURL } from "$lib/services/libs";
	import { socket } from "$lib/socket";
  import { user, contact, users, options } from "$lib/store";
  import EditChat from "./EditChat.svelte";
  import List from "./List.svelte";
  import Image from "./BoxImage.svelte";

	export let editGroups: (room: string, content: string, createdAt: Date) => void;
	export let leaveUser: (id: string, room: string) => void;
	export let leaveGroup: (id: string, room: string) => void;

	let usersValues: IContact[];
	let optionValue: IKeys<boolean>;
	let visible = false;
	let allowed = true;
	let option = '';
	let message = '';
	let imgSRC: string;
	let altSRC: string;
	let chats: IChat[] = [];
	let div: HTMLElement;
	let members: Members[] = [];
	let banIDs: string[] = [];
	let blockedUsers: Members[] = [];
	let unblockedIDs: string[] = [];
	let newMods: Members[] = [];
	let removeMods: Members[] = [];
	let src = DIR + selectAvatarURL($contact);
	let socketFile: File;
	let description = $contact.description;
	let state = StateOption.PUBLIC;
	
	users.subscribe(value => usersValues = value as IContact[]);

	options.subscribe(value => optionValue = value);

	const socketFunction: IKeys<() => any> = {
		LEAVE: () => [],
		BLOCKGROUP: () => {
			user.updateBlock({
				id: $contact.contactID,
				name: $contact.name,
				type: TypeContact.GROUP
			});

			return [$contact.name];
		},
		ADD: () => [members, $contact.contactID],
		BAN: () => [banIDs, $contact.contactID],
		BLOCK: () => [blockedUsers, $contact.contactID],
		UNBLOCK: () => [unblockedIDs, $contact.contactID],
		ADDMOD: () => [newMods, $contact.contactID],
		REMOVEMOD: () => [removeMods, $contact.contactID],
		DESCRIPTION: () => [description],
		STATE: () => [state],
		DESTROY: () => []
	};

	function handleDelete(id: string, from: string) {
		if ($user.id === from) {
			option = id;
			options.setOption('chat');
		}
	}

	function handleUser(value: string) {
		visible = false;
		allowed = true;
		option = value;
		options.setOption('user');
	}

	function handleGroup(value: string) {
		visible = false;
		allowed = true;
		option = value;
		options.setOption('group');
	}

	function isNotMember() {
		const newMembers: Members[] = [];
		const mods: Members[] = $contact.mods ? $contact.mods : [];
		const members: Members[] = $contact.members ? $contact.members : [];
		const memberIDs = [...mods, ...members].map(member => member.id);

		for (const { contactID, name } of usersValues) {
			if (!memberIDs.includes(contactID)) newMembers.push({ id: contactID, name });
		}

		return newMembers;
	}

	async function handleAvatar(this: HTMLInputElement) {
		const files = this.files as FileList;
		const file = files[0];
		const reader = new FileReader();
		const validFormats = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];

		reader.addEventListener('load', async ({ target }) => {
			if (file.size <= 512000 && validFormats.includes(file.type)) {
				src = target?.result as string;
				socketFile = file;
			}
		});

		reader.readAsDataURL(file);
	}

	function handleImage(this: HTMLImageElement) {
		console.log(this.src)
		imgSRC = this.src;
		altSRC = this.alt;
		optionValue.image = true;
	}

	function getMembers() {
		const newMembers: Members[] = [];
		const mods: Members[] = $contact.mods ? $contact.mods : [];
		const members: Members[] = $contact.members ? $contact.members : [];
		const memberIDs = [...mods, ...members].map(member => member.id);

		for (const { contactID, name } of usersValues) {
			if (memberIDs.includes(contactID)) newMembers.push({ id: contactID, name });
		}

		return newMembers;
	}

	function addMembers(member: Members, members: Members[]): Members[] {
		if (
			!members
				.map(user => user.id)
				.includes(member.id)
		) return [member, ...members];
		
		return members.filter(user => user.id !== member.id);
	}

	function banMembers(id: string, banIDs: string[]) {
		if (!banIDs.includes(id)) return [id, ...banIDs];

		return banIDs.filter(memberID => memberID !== id);
	}

	function sendMessage() {
		const chat = getChat($user, $contact, message);

		loadChat(chat);

		socket.emit('emitChat', message, chat._id);

		if ($contact.type === TypeContact.GROUP && typeof chat.content === 'string') {
			editGroups($contact.roomID, chat.content, chat.createdAt);
		}

		message = '';
	}

	async function sendImage(this: HTMLInputElement) {
		if (this.files && this.files.length < 4) {
			const formData = new FormData();
			const validFormat = ['image/png', 'image/jpeg', 'image/gif'];
			let match = true;

			for (const file of this.files) {
				if (file.size > 1e7 * 2 && !validFormat.includes(file.type)) {
					match = false;
					break;
				}

				formData.append('images', file);
			}

			if (match) {
				const data = await axios({
					method: 'POST',
					url: DIR + '/api/home/images',
					data: formData,
					withCredentials: true
				}).then(res => res.data)
					.catch(err => err);

				if (data && data.filenames) {
					const chat = getChat($user, $contact, data.filenames);

					loadChat(chat);

					socket.emit('emitChat', data.filenames, chat._id);

					if ($contact.type === TypeContact.GROUP && chat.content instanceof Array) {
						editGroups($contact.roomID, chat.content[0], chat.createdAt);
					}

					message = '';
				}
			}

			formData.delete('images');
		}
	}

	function userOptions(value: string) {
		if (OptionUser[value]) {
			socket.emit(OptionUser[value], $contact.contactID, $contact.roomID);

			if (OptionUser[value] === OptionUser.BLOCK || OptionUser[value] === OptionUser.BAD) {
				user.updateBlock({ id: $contact.contactID, name: $contact.name, type: TypeContact.USER });
			}
		}

		options.resetOptions();
		leaveUser($contact.contactID, $contact.roomID);
	}

	async function groupOptions(value: string) {
		if (value === AdminOptions.AVATAR) {
			const formData = new FormData();
			formData.set('avatar', socketFile);
			formData.set('id', $contact.contactID);

			const data = await axios({
				method: 'POST',
				url: DIR + '/api/home/group',
				data: formData,
				withCredentials: true
			}).then(res => res.data);

			if (data && data.filename) {
				socket.emit(OptionAdmin[value], data.filename);
			}

			options.resetOptions();
		} else if (OptionMember[value]) {
			socket.emit(OptionMember[value], ...socketFunction[value]());
			options.resetOptions();
			leaveGroup($contact.contactID, $contact.roomID);
		} else if (OptionMod[value]) {
			socket.emit(OptionMod[value], ...socketFunction[value]());
			options.resetOptions();
		} else if (OptionAdmin[value] && value !==  OptionAdmin.AVATAR) {
			socket.emit(OptionAdmin[value], ...socketFunction[value]());
			options.resetOptions();
		}
	}

	function emitDelete(id: string) {
		socket.emit('emitDelete', id);
		deleteChat(id);
		options.resetOptions();
	}

	const loadChat = (message: IChat) => chats = [...chats, message];

	const loadChats = (messages: IChat[]) => chats = messages;

	const deleteChat = (id: string) => chats = chats.filter(({ _id }) => _id !== id);

	const loadChatID = (id: string, tempID: string) => {
		chats = chats.map(chat => {
			if (chat._id === tempID) chat._id = id;

			return chat;
		});
	};

	onMount(() => {
		socket.on('loadChat', loadChat);
		socket.on('loadChats', loadChats);
		socket.on('deleteChat', deleteChat);
		socket.on('loadChatID', loadChatID);

		return () => {
			socket.off('loadChat', loadChat);
			socket.off('loadChats', loadChats);
			socket.off('deleteChat', deleteChat);
			socket.off('loadChatID', loadChatID);
		};
	});

	afterUpdate(() => div.scrollTo(0, div.scrollHeight));
</script>

{#if optionValue.image}
	<Image bind:img={optionValue.image} src={imgSRC} alt={altSRC} />
{/if}

{#if optionValue.user}
	<EditChat bind:visible={optionValue.user} option={option} handle={userOptions}>
		<h2 class="title">Are you sure you want to do this action?</h2>
		{#if option === UserOptions.LEAVE}
			<span class="span">
				This user will be removed from your contact list.
			</span>
			{:else if option === UserOptions.BLOCK}
			<span class="span">
				This user will be removed from your contact list and blocked.
				If you want unblock this user go to Settings > Blocked Users.
			</span>
			{:else if option === UserOptions.DESTROY}
			<span class="span">
				This user will be removed from your contact list and all messages will be deleted.
			</span>
			{:else if option === UserOptions.BAD}
			<span class="span">
				This user will be removed and blocked from your contact list and all messages will be deleted.
				If you want unblock this user go to Settings > Blocked Users.
			</span>
		{/if}
	</EditChat>
{/if}

{#if optionValue.group}
	<EditChat bind:visible={optionValue.group} option={option} handle={groupOptions}>
		<h2 class="title">Are you sure you want to do this action?</h2>
		{#if option === MemberOptions.LEAVE}
			<span class="span">
				This group will be removed from your contact list.
			</span>
			{:else if option === MemberOptions.BLOCKGROUP}
			<span class="span">
				This group will be removed from your contact list and blocked.
				If you want unblock this user go to Settings > Blocked Users.
			</span>
			{:else if option === ModOptions.ADD}
			<span class="span span-grid">
				{#if isNotMember().length}
					<p>Add member:</p>
					{#each isNotMember() as user (user.id)}
						<div>
							{user.name}
							<input
								type="checkbox"
								on:click={() => members = addMembers(user, members)}
							>
						</div>
					{/each}
					{:else}
					<p>All your contacts are members of this group.</p>
				{/if}
			</span>
			{:else if option === ModOptions.BAN}
			<span class="span span-grid">
				{#if getMembers().length}
					<p>Ban member:</p>
					{#each getMembers() as user (user.id)}
						<div>
							{user.name}
							<input
								type="checkbox"
								on:click={() => banIDs = banMembers(user.id, banIDs)}
							>
						</div>
					{/each}
					{:else}
					<p>This group has no contacts.</p>
				{/if}
			</span>
			{:else if option === ModOptions.BLOCK}
			<span class="span span-grid">
				{#if getMembers().length}
					<p>Block member:</p>
					{#each getMembers() as user (user.id)}
						<div>
							{user.name}
							<input
								type="checkbox"
								on:click={() => blockedUsers = addMembers(user, blockedUsers)}
							>
						</div>
					{/each}
					{:else}
					<p>This group has no contacts.</p>
				{/if}
			</span>
			{:else if option === ModOptions.UNBLOCK}
			<span class="span span-grid">
				{#if $contact.blacklist?.length}
					<p>Unblock member:</p>
					{#each $contact.blacklist as user (user.id)}
						<div>
							{user.name}
							<input
								type="checkbox"
								on:click={() => unblockedIDs = banMembers(user.id, unblockedIDs)}
							>
						</div>
					{/each}
					{:else}
					<p>This group has no contacts blocked.</p>
				{/if}
			</span>
			{:else if option === AdminOptions.ADDMOD}
			<span class="span span-grid">
				{#if $contact.members?.length}
					<p>Add member:</p>
					{#each $contact.members as member (member.id)}
						<div>
							{member.name}
							<input
								type="checkbox"
								on:click={() => newMods = addMembers(member, newMods)}
							>
						</div>
					{/each}
					{:else}
					<p>All your contacts are members of this group.</p>
				{/if}
			</span>
			{:else if option === AdminOptions.REMOVEMOD}
			<span class="span span-grid">
				{#if $contact.mods?.length}
					<p>Remove member:</p>
					{#each $contact.mods as member (member.id)}
						<div>
							{member.name}
							<input
								type="checkbox"
								on:click={() => removeMods = addMembers(member, removeMods)}
							>
						</div>
					{/each}
					{:else}
					<p>All your contacts are members of this group.</p>
				{/if}
			</span>
			{:else if option === AdminOptions.AVATAR}
			<span class="span span-flex">
				Load the new image (max. 500KB):
				<label>
					<img src={src} alt={$contact.name}>
					<input type="file" name="avatar" on:change={handleAvatar}>
				</label>
			</span>
			{:else if option === AdminOptions.DESCRIPTION}
			<span class="span span-flex">
				Insert the new description (max. 420 characters):
				<textarea name="description" bind:value={description} rows="5"></textarea>
			</span>
			{:else if option === AdminOptions.STATE}
			<span class="span span-flex">
				<p>Choose visibility:</p>
				<label>
					<input
						type="radio"
						name="option"
						on:click={() => state = StateOption.PUBLIC}
						checked
					>
					Public
				</label>
				<label>
					<input
						type="radio"
						name="option"
						on:click={() => state = StateOption.PROTECTED}
					>
					Protected
				</label>
				<label>
					<input
						type="radio"
						name="option"
						on:click={() => state = StateOption.PRIVATE}
					>
					Private
				</label>
				<span>
					{#if state === StateOption.PUBLIC}
						Everyone can join the group
						{:else if state === StateOption.PROTECTED}
						Only member contacts can join
						{:else}
						Only members with authorization from the admin or moderators can join
					{/if}
				</span>
			</span>
			{:else if option === AdminOptions.DESTROY}
			<span class="span">
				This group will be removed from your contact list and blocked.
				If you want unblock this user go to Settings > Blocked Users.
			</span>
		{/if}
	</EditChat>
{/if}

{#if optionValue.chat}
	<EditChat bind:visible={optionValue.chat} option={option} handle={emitDelete}>
		<h2 class="title">Are you sure you want delete this message?</h2>
	</EditChat>
{/if}

<div class="contact">
	<img src={DIR + selectAvatarURL($contact)} alt={$contact.name}>
	<div>
		<h2>{$contact.name}</h2>
		{#if typeof $contact.logged === 'boolean'}
			<p>
				<span class:green={$contact.logged === true}>&#11044;</span>
				{$contact.logged ? 'Connected' : 'Disconnected'}
			</p>
			{:else}
			<p>
				<span class='blue'>&#11044;</span>
				{$contact.logged} Connected Users
			</p>
		{/if}
	</div>
	<List bind:visible={visible} bind:allowed={allowed}>
		{#if $contact.type === TypeContact.USER}
			<li on:mousedown={() => handleUser(UserOptions.LEAVE)}>Leave Room</li>
			<li on:mousedown={() => handleUser(UserOptions.BLOCK)}>Block User</li>
			<li on:mousedown={() => handleUser(UserOptions.DESTROY)}>Destroy Chat</li>
			<li on:mousedown={() => handleUser(UserOptions.BAD)}>Destroy and Block</li>
		{/if}
		{#if isMember($contact.members, $user.id) || isMod($contact.mods, $user.id)}
			<li on:mousedown={() => handleGroup(MemberOptions.LEAVE)}>Leave Group</li>
			<li on:mousedown={() => handleGroup(MemberOptions.BLOCKGROUP)}>Block Group</li>
		{/if}
		{#if isMod($contact.mods, $user.id) || $user.id === $contact.admin}
			<li on:mousedown={() => handleGroup(ModOptions.ADD)}>Add Member</li>
			<li on:mousedown={() => handleGroup(ModOptions.BAN)}>Ban Member</li>
			<li on:mousedown={() => handleGroup(ModOptions.BLOCK)}>Block Member</li>
			<li on:mousedown={() => handleGroup(ModOptions.UNBLOCK)}>Unblock Member</li>
		{/if}
		{#if $user.id === $contact.admin}
			<li on:mousedown={() => handleGroup(AdminOptions.ADDMOD)}>Add Mod</li>
			<li on:mousedown={() => handleGroup(AdminOptions.REMOVEMOD)}>Remove Mod</li>
			<li on:mousedown={() => handleGroup(AdminOptions.AVATAR)}>Change Avatar</li>
			<li on:mousedown={() => handleGroup(AdminOptions.DESCRIPTION)}>Change Description</li>
			<li on:mousedown={() => handleGroup(AdminOptions.STATE)}>Change State</li>
			<li on:mousedown={() => handleGroup(AdminOptions.DESTROY)}>Destroy Group</li>
		{/if}
	</List>
</div>
<div class="chats" bind:this={div}>
	{#each chats as chat (chat._id)}
		<div
			class='chat {$user.id === chat.from ? 'me' : ''}'
			on:dblclick={() => handleDelete(chat._id, chat.from)}
			role='main'
		>
			{#if chat.username}
				<p class="username">{chat.username}</p>
			{/if}
			{#if (chat.content instanceof Array)}
				{#each chat.content as image (image)}
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<img
						src={DIR + '/uploads/' + image}
						alt={chat._id}
						on:mousedown={handleImage}
					>				
				{/each}
				{:else if validator.isURL(chat.content)}
				<a href='{chat.content}' target="_blank">{chat.content}</a>
				{:else}
				<p>{@html chat.content}</p>
			{/if}
			<p class="left">{format(chat.createdAt)}</p>
		</div>
	{/each}
</div>
<div class="message">
	<form class="text" on:submit|preventDefault={sendMessage}>
		<input type="text" bind:value={message}>
	</form>
	<label>
		<i class="fa-solid fa-images"></i>
		<input type="file" on:change|preventDefault={sendImage} multiple>
	</label>
</div>

<style lang="postcss">
	.title {
		@apply text-center text-lg font-semibold;
		line-height: 1.09;
	}

	.span {
		background-color: #ececec;
		color: #404040;
		@apply w-full p-2.5 rounded font-medium gap-1.5;
	}

	.span-grid {
		grid-template-columns: repeat(2, 1fr);
		@apply grid;
	}

	.span-flex {
		@apply flex flex-wrap gap-1;
	}

	.span p {
		grid-column: 1 / span 2;
		width: 100%;
	}

	.span div {
		@apply flex;
	}

	.span span {
		@apply w-full text-center;
	}

	.span input[type='checkbox'] {
		@apply ml-auto;
	}

	.span input[type='file'] {
		@apply hidden;
	}

	.span label {
		@apply w-60 h-60;
	}

	.span img {
		@apply w-full h-full rounded-full;
	}

	.span textarea {
		outline: 1px solid #b1b1b1;
		@apply w-full p-2 rounded-lg;
	}

	.contact, .chats, .message {
		grid-column: 2 / span 1;
		@apply w-full;
	}

	.contact, .message {
		background-color: #e7e7e7;
		@apply p-2.5;
	}

	.contact {
		grid-row: 1 / span 1;
		@apply flex items-center gap-2.5;
	}

	.contact div {
		@apply flex flex-wrap items-center w-full;
	}

	.contact h2 {
		@apply max-h-5 overflow-hidden text-ellipsis text-xl font-semibold leading-none;
	}

	.contact p {
		color: #444444;
		@apply flex items-center w-full font-medium gap-1;
	}

	.contact span {
		font-size: 8px;
	}

	.contact .green {
		color: #1e9224;
	}

	.contact .blue {
		color: #62bdf1;
	}

	.contact li {
		padding: 5px 20px;
		@apply font-bold leading-tight;
	}

	.contact li:hover {
		background-color: #999999;
		color: #ffffff;
	}

	.contact img {
		min-width: 40px;
		min-heigth: 40px;
		box-shadow: 0 0 5px #999999;
		@apply w-10 h-10 object-cover rounded-full;
	}

	.chats {
		grid-row: 2 / span 1;
		grid-auto-rows: min-content;
		background-image: url('/smiley.jpg');
		scrollbar-width: none;
		scrollbar-color: #6198d6 transparent;
		@apply grid p-5 bg-no-repeat bg-cover overflow-y-auto gap-y-3;
	}

	.chat {
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: min-content;
		max-width: 60%;
		min-width: 200px;
		background-color: #ffffff;
		box-shadow: 0 0 0 1px #aaaaaa;
		@apply grid w-fit p-2.5 rounded-lg gap-x-1 gap-y-1 select-none;
	}

	.chat img {
		@apply w-full self-start object-cover object-top cursor-pointer;
	}

	.chat p {
		grid-column: 1 / span 2;
		@apply overflow-hidden leading-tight break-words;
	}

	.chat a {
		grid-column: 1 / span 2;
		color: #346eb1;
		@apply overflow-hidden leading-tight break-words;
	}

	.chat:hover a {
		color: #7b24a3;
	}

	.me {
		@apply ml-auto;
	}

	.left {
		@apply ml-auto;
	}

	.username {
		@apply font-semibold;
	}

	.message {
		grid-row: 3 / span 1;
		@apply flex gap-2.5;
	}

	.message .text {
		@apply w-full;
	}

	.message input {
		box-shadow: 0 0 0 1px #777777;
		@apply w-full p-2.5 rounded-lg;
	}

	.message label {
		min-width: 40px;
		min-height: 40px;
		background-color: #ffffff;
		box-shadow: 0 0 0 1px #777777;
		@apply flex justify-center items-center w-10 h-10 rounded-full cursor-pointer;
	}
</style>
