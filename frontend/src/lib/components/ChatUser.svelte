<script lang="ts">
	import type { IContact, IKeys, ResponseData } from "$lib/types/global";
  import { onDestroy } from "svelte";
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
    StateOption,
    Formats,
    Option,

    Name

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
	let className = '';
	let imgSRC: string;
	let altSRC: string;
	let src = DIR + selectAvatarURL($contact);
	let socketFile: File;

	console.log($contact)
	
	const unsubUsers = users.subscribe(value => usersValues = value as IContact[]);
	const unsubGroups = groups.subscribe(value => groupsValues = value as IContact[]);
	const unsubOptions = options.subscribe(value => optionValue = value);

	function selectContact(value: string, opt: string, name: string) {
		visible = false;
		option = value;
		className = name;
		options.setOption(opt);
	}

	async function handleAvatar(this: HTMLInputElement) {
		const reader = new FileReader();
		const validFormat: string[] = Object.values(Formats);
		const files = this.files as FileList;

		reader.addEventListener('load', async ({ target }) => {
			src = target?.result as string;
			socketFile = files[0];
		});

		if (files && files[0].size <= 512000 && validFormat.includes(files[0].type)) {
			reader.readAsDataURL(files[0]);
		}
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

			const data: ResponseData = await axios({
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
	
	onDestroy(() => {
		return {
			unsubUsers,
			unsubGroups,
			unsubOptions
		}
	});
</script>

{#if optionValue.image}
	<Image bind:img={optionValue.image} src={imgSRC} alt={altSRC} />
{/if}

{#if optionValue.user}
	<EditChat bind:visible={optionValue.user} option={option} handle={userOptions}>
		<h2 class="title">Are you sure you want to do this action?</h2>
		<span class={className}>
			{#if option === UserOptions.LEAVE}
					This user will be removed from your contact list.
				{:else if option === UserOptions.BLOCK}
					This user will be removed from your contact list and blocked.
					If you want unblock this user go to Settings > Blocked Users.
				{:else if option === UserOptions.DESTROY}
					This user will be removed from your contact list and all messages will be deleted.
				{:else if option === UserOptions.BAD}
					This user will be removed and blocked from your contact list and all messages will be deleted.
					If you want unblock this user go to Settings > Blocked Users.
			{/if}
		</span>
	</EditChat>
{/if}

{#if optionValue.group}
	<EditChat bind:visible={optionValue.group} option={option} handle={groupOptions}>
		<h2 class="title">Are you sure you want to do this action?</h2>
		<span class={className}>
			{#if option === MemberOptions.LEAVE}
					This group will be removed from your contact list.
				{:else if option === MemberOptions.BLOCKGROUP}
					This group will be removed from your contact list and blocked.
					If you want unblock this user go to Settings > Blocked Users.
				{:else if option === ModOptions.ADD}
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
				{:else if option === ModOptions.BAN}
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
				{:else if option === ModOptions.BLOCK}
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
				{:else if option === ModOptions.UNBLOCK}
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
				{:else if option === AdminOptions.ADDMOD}
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
				{:else if option === AdminOptions.REMOVEMOD}
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
				{:else if option === AdminOptions.AVATAR}
					Load the new image (max. 500KB):
					<label class="label-image">
						<img src={src} alt={$contact.name}>
						<input type="file" name="avatar" on:change={handleAvatar}>
					</label>
				{:else if option === AdminOptions.DESCRIPTION}
					Insert the new description (max. 420 characters):
					<textarea name="description" bind:value={groupProps.DESCRIPTION} rows="5"></textarea>
				{:else if option === AdminOptions.STATE}
					<p>Choose visibility:</p>
					<label>
						<input
							type="radio"
							name="option"
							on:click={() => groupProps.STATE = StateOption.PUBLIC}
							checked
						>
						Public
					</label>
					<label>
						<input
							type="radio"
							name="option"
							on:click={() => groupProps.STATE = StateOption.PROTECTED}
						>
						Protected
					</label>
					<label>
						<input
							type="radio"
							name="option"
							on:click={() => groupProps.STATE = StateOption.PRIVATE}
						>
						Private
					</label>
					<span>
						{#if groupProps.STATE === StateOption.PUBLIC}
							Everyone can join the group
							{:else if groupProps.STATE === StateOption.PROTECTED}
							Only member contacts can join
							{:else}
							Only members with authorization from the admin or moderators canjoin
						{/if}
					</span>
				{:else if option === AdminOptions.DESTROY}
					This group will be removed from your contact list and blocked.
					If you want unblock this user go to Settings > Blocked Users.
			{/if}
		</span>
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
			<li on:mousedown={() => selectContact(UserOptions.LEAVE, Option.USER, Name.SPAN)} role='none'>
				Leave Room
			</li>
			<li on:mousedown={() => selectContact(UserOptions.BLOCK, Option.USER, Name.SPAN)} role='none'>
				Block User
			</li>
			<li on:mousedown={() => selectContact(UserOptions.DESTROY, Option.USER, Name.SPAN)} role='none'>
				Destroy Chat
			</li>
			<li on:mousedown={() => selectContact(UserOptions.BAD, Option.USER, Name.SPAN)} role='none'>
				Destroy and Block
			</li>
		{/if}
		{#if isMember($contact.members, $user.id) || isMod($contact.mods, $user.id)}
			<li on:mousedown={() => selectContact(MemberOptions.LEAVE, Option.GROUP, Name.SPAN)} role='none'>
				Leave Group
			</li>
			<li on:mousedown={() => selectContact(MemberOptions.BLOCKGROUP, Option.GROUP, Name.SPAN)} role='none'>
				Block Group
			</li>
		{/if}
		{#if isMod($contact.mods, $user.id) || $user.id === $contact.admin}
			<li on:mousedown={() => selectContact(ModOptions.ADD, Option.GROUP, Name.GRID)} role='none'>
				Add Member
			</li>
			<li on:mousedown={() => selectContact(ModOptions.BAN, Option.GROUP, Name.GRID)} role='none'>
				Ban Member
			</li>
			<li on:mousedown={() => selectContact(ModOptions.BLOCK, Option.GROUP, Name.GRID)} role='none'>
				Block Member
			</li>
			<li on:mousedown={() => selectContact(ModOptions.UNBLOCK, Option.GROUP, Name.GRID)} role='none'>
				Unblock Member
			</li>
		{/if}
		{#if $user.id === $contact.admin}
			<li on:mousedown={() => selectContact(AdminOptions.ADDMOD, Option.GROUP, Name.GRID)} role='none'>
				Add Mod
			</li>
			<li on:mousedown={() => selectContact(AdminOptions.REMOVEMOD, Option.GROUP, Name.GRID)} role='none'>
				Remove Mod
			</li>
			<li on:mousedown={() => selectContact(AdminOptions.AVATAR, Option.GROUP, Name.FLEX)} role='none'>
				Change Avatar
			</li>
			<li on:mousedown={() => selectContact(AdminOptions.DESCRIPTION, Option.GROUP, Name.FLEX)} role='none'>
				Change Description
			</li>
			<li on:mousedown={() => selectContact(AdminOptions.STATE, Option.GROUP, Name.FLEX)} role='none'>
				Change State
			</li>
			<li on:mousedown={() => selectContact(AdminOptions.DESTROY, Option.GROUP, Name.SPAN)} role='none'>
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

	.span, .span-flex, .span-grid {
		background-color: #ececec;
		color: #404040;
		@apply w-full p-2.5 rounded font-medium gap-1.5;
	}

	.span-grid {
		grid-template-columns: repeat(2, 1fr);
		@apply grid;
	}

	.span-grid div {
		@apply flex;
	}

	.span-grid input[type='checkbox'] {
		@apply ml-auto;
	}

	.span-flex {
		@apply flex flex-wrap gap-1;
	}

	.span-flex input[type='file'] {
		@apply hidden;
	}

	.span-flex .label-image {
		@apply w-60 h-60;
	}

	.span-flex img {
		@apply w-full h-full rounded-full;
	}

	.span-flex textarea {
		outline: 1px solid #b1b1b1;
		@apply w-full p-2 rounded-lg;
	}

	.span-flex span {
		@apply w-full text-center;
	}

	.span-flex p, .span-grid p {
		grid-column: 1 / span 2;
		width: 100%;
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
