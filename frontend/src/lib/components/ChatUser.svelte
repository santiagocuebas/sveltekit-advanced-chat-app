<script lang="ts">
	import type { IContact, IKeys } from "$lib/types/global";
  import axios from "axios";
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
	} from "$lib/types/enums";
	import { socket } from "$lib/socket";
  import { leaveUser, leaveGroup } from '$lib/sockets.js';
  import {
		initGroupProps,
		getMembers,
		isNotMember,
		addMembers,
		banMembers,
		isMember,
		isMod,
		selectAvatarURL
	} from "$lib/services/chat-libs";
  import { socketResult } from "$lib/services/socket-result";
  import { user, contact, users, groups, options } from "$lib/store";
  import EditChat from "./EditChat.svelte";
  import List from "./List.svelte";
  import Image from "./BoxImage.svelte";
  import BoxChat from "./Chats.svelte";

	const initProps = initGroupProps();
	let groupProps = initProps.getProps($contact);
	let usersValues: IContact[];
	let groupsValues: IContact[];
	let optionValue: IKeys<boolean>;
	let visible = false;
	let option = '';
	let imgSRC: string;
	let altSRC: string;
	let src = DIR + selectAvatarURL($contact);
	let socketFile: File;
	
	users.subscribe(value => usersValues = value as IContact[]);
	groups.subscribe(value => groupsValues = value as IContact[]);
	options.subscribe(value => optionValue = value);

	function handleUser(value: string) {
		visible = false;
		option = value;
		options.setOption('user');
	}

	function handleGroup(value: string) {
		visible = false;
		option = value;
		options.setOption('group');
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
		imgSRC = this.src;
		altSRC = this.alt;
		optionValue.image = true;
	}

	function userOptions(option: string) {
		if (OptionUser[option]) {
			socket.emit(OptionUser[option], $contact.contactID, $contact.roomID);

			if (OptionUser[option] === OptionUser.BLOCK || OptionUser[option] === OptionUser.BAD) {
				user.updateBlock({ id: $contact.contactID, name: $contact.name, type: TypeContact.USER });
			}
		}

		options.resetOptions();
		leaveUser($contact.contactID, $contact.roomID);
	}

	async function groupOptions(option: string) {
		const choiceResult = socketResult(groupsValues, $contact);

		if (option === AdminOptions.AVATAR) {
			const formData = new FormData()
			formData.append('avatar', socketFile);
			formData.append('id', $contact.contactID);

			const data = await axios({
				method: 'POST',
				url: DIR + '/api/home/group',
				data: formData,
				withCredentials: true
			}).then(res => res.data)
				.catch(err => err);

			if (data && data.filename) {
				socket.emit(OptionAdmin[option], ...choiceResult[option](data.filename));
			}
		} else if (OptionMember[option]) {
			socket.emit(OptionMember[option], ...choiceResult[option](undefined));
			leaveGroup($contact.contactID);
		} else if (OptionMod[option]) {
			socket.emit(OptionMod[option], ...choiceResult[option](groupProps[option]));
		} else if (OptionAdmin[option] && option !==  OptionAdmin.AVATAR) {
			socket.emit(OptionAdmin[option], ...choiceResult[option](groupProps[option]));
		}
		
		if (option === AdminOptions.DESTROY) leaveGroup($contact.contactID);
		
		groupProps = initProps.resetProps(groupProps);
		options.resetOptions();
	}
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
				{#if isNotMember(usersValues, $contact).length}
					<p>Add member:</p>
					{#each isNotMember(usersValues, $contact) as user (user.id)}
						<div>
							{user.name}
							<input
								type="checkbox"
								on:click={() => groupProps.ADD = addMembers(user, groupProps.ADD)}
							>
						</div>
					{/each}
					{:else}
					<p>All your contacts are members of this group.</p>
				{/if}
			</span>
			{:else if option === ModOptions.BAN}
			<span class="span span-grid">
				{#if getMembers($contact).length}
					<p>Ban member:</p>
					{#each getMembers($contact) as user (user.id)}
						<div>
							{user.name}
							<input
								type="checkbox"
								on:click={() => groupProps.BAN = banMembers(user.id, groupProps.BAN)}
							>
						</div>
					{/each}
					{:else}
					<p>This group has no contacts.</p>
				{/if}
			</span>
			{:else if option === ModOptions.BLOCK}
			<span class="span span-grid">
				{#if getMembers($contact).length}
					<p>Block member:</p>
					{#each getMembers($contact) as user (user.id)}
						<div>
							{user.name}
							<input
								type="checkbox"
								on:click={() => groupProps.BLOCK = addMembers(user, groupProps.BLOCK)}
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
								on:click={() => groupProps.UNBLOCK = banMembers(user.id, groupProps.UNBLOCK)}
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
								on:click={() => groupProps.ADDMOD = addMembers(member, groupProps.ADDMOD)}
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
								on:click={() => groupProps.REMOVEMOD = addMembers(member, groupProps.REMOVEMOD)}
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
				<textarea name="description" bind:value={groupProps.DESCRIPTION} rows="5"></textarea>
			</span>
			{:else if option === AdminOptions.STATE}
			<span class="span span-flex">
				<p>Choose visibility:</p>
				<label>
					<input type="radio" name="option" on:click={() => groupProps.STATE = StateOption.PUBLIC} checked>
					Public
				</label>
				<label>
					<input type="radio" name="option" on:click={() => groupProps.STATE =  StateOption.PROTECTED}>
					Protected
				</label>
				<label>
					<input type="radio" name="option" on:click={() => groupProps.STATE = StateOption.PRIVATE}>
					Private
				</label>
				<span>
					{#if groupProps.STATE === StateOption.PUBLIC}
						Everyone can join the group
						{:else if groupProps.STATE === StateOption.PROTECTED}
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
	<List bind:visible={visible}>
		{#if $contact.type === TypeContact.USER}
			<li on:mousedown={() => handleUser(UserOptions.LEAVE)} role='none'>
				Leave Room
			</li>
			<li on:mousedown={() => handleUser(UserOptions.BLOCK)} role='none'>
				Block User
			</li>
			<li on:mousedown={() => handleUser(UserOptions.DESTROY)} role='none'>
				Destroy Chat
			</li>
			<li on:mousedown={() => handleUser(UserOptions.BAD)} role='none'>
				Destroy and Block
			</li>
		{/if}
		{#if isMember($contact.members, $user.id) || isMod($contact.mods, $user.id)}
			<li on:mousedown={() => handleGroup(MemberOptions.LEAVE)} role='none'>
				Leave Group
			</li>
			<li on:mousedown={() => handleGroup(MemberOptions.BLOCKGROUP)} role='none'>
				Block Group
			</li>
		{/if}
		{#if isMod($contact.mods, $user.id) || $user.id === $contact.admin}
			<li on:mousedown={() => handleGroup(ModOptions.ADD)} role='none'>
				Add Member
			</li>
			<li on:mousedown={() => handleGroup(ModOptions.BAN)} role='none'>
				Ban Member
			</li>
			<li on:mousedown={() => handleGroup(ModOptions.BLOCK)} role='none'>
				Block Member
			</li>
			<li on:mousedown={() => handleGroup(ModOptions.UNBLOCK)} role='none'>
				Unblock Member
			</li>
		{/if}
		{#if $user.id === $contact.admin}
			<li on:mousedown={() => handleGroup(AdminOptions.ADDMOD)} role='none'>
				Add Mod
			</li>
			<li on:mousedown={() => handleGroup(AdminOptions.REMOVEMOD)} role='none'>
				Remove Mod
			</li>
			<li on:mousedown={() => handleGroup(AdminOptions.AVATAR)} role='none'>
				Change Avatar
			</li>
			<li on:mousedown={() => handleGroup(AdminOptions.DESCRIPTION)} role='none'>
				Change Description
			</li>
			<li on:mousedown={() => handleGroup(AdminOptions.STATE)} role='none'>
				Change State
			</li>
			<li on:mousedown={() => handleGroup(AdminOptions.DESTROY)} role='none'>
				Destroy Group
			</li>
		{/if}
	</List>
</div>
<BoxChat bind:option={option} bind:chat={optionValue.chat} handle={handleImage} />

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

	.contact {
		grid-column: 2 / span 1;
		@apply w-full;
	}

	.contact {
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
</style>
