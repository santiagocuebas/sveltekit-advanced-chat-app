<script lang="ts">
	import type { IForeign, IGroupProps } from "$lib/types/global";
  import { onDestroy } from "svelte";
	import { DIR } from "$lib/config";
  import {
		OptionUser,
		OptionMember,
		OptionMod,
		OptionAdmin,
    avatarURL,
    Messages,
    UserText,
    GroupText
	} from "$lib/dictionary";
	import {
		UserOptions,
		MemberOptions,
		ModOptions,
		AdminOptions,
    StateOption,
    Formats,
    Option
	} from "$lib/types/enums";
	import { socket } from "$lib/socket";
  import { leaveUser, leaveGroup } from '$lib/sockets.js';
  import {
		setGroupProps,
		isNotMember,
		addMember,
		banMember,
		isMember,
		isMod
	} from "$lib/services/chat-libs";
  import { changeName, sendAvatar } from "$lib/services/libs";
  import { socketResult } from "$lib/services/socket-result";
  import { user, contact, users, options } from "$lib/store";
  import Edit from "./EditChat.svelte";
  import List from "./List.svelte";
  import Chat from "./Chats.svelte";
  import Box from "./OptionBox.svelte";

	let groupProps: IGroupProps;
	let usersValues: IForeign[];
	let visible = false;
	let option = '';
	let socketFile: File;

	$: src = DIR + avatarURL[$contact.type] + $contact.avatar;
	
	const unsubUsers = users.subscribe(value => usersValues = value as IForeign[]);

	function selectContact(value: string, key: string) {
		if (key === Option.GROUP) groupProps = setGroupProps($contact);
		visible = false;
		option = value;
		options.setOption(key);
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

	function userOptions(option: string) {
		if (OptionUser[option]) {
			socket.emit(OptionUser[option], $contact.contactID, $contact.roomID);

			if (option === UserOptions.BLOCK || option === UserOptions.BAD) {
				user.blockContact({ id: $contact.contactID, name: $contact.name }, 'users');
			}
		}

		options.resetOptions();
		leaveUser($contact.contactID, $contact.roomID);
	}

	async function groupOptions() {
		const choiceResult = socketResult($contact);
		const data = groupProps[option];

		if (option === AdminOptions.AVATAR) {
			const filename = await sendAvatar(socketFile, $contact.contactID);

			if (filename) {
				socket.emit(OptionAdmin[option], ...choiceResult[option](filename));
			}
		} else if (OptionMember[option]) {
			socket.emit(OptionMember[option], ...choiceResult[option](undefined));
			leaveGroup($contact.contactID);
		} else if (OptionMod[option]) {
			socket.emit(OptionMod[option], ...choiceResult[option](data));
		} else if (OptionAdmin[option] && option !== AdminOptions.AVATAR) {
			socket.emit(OptionAdmin[option], ...choiceResult[option](data));
			if (option === AdminOptions.DESTROY) leaveGroup($contact.contactID);
		}
		
		options.resetOptions();
	}
	
	onDestroy(unsubUsers);
</script>

{#if $options.user}
	<Edit handle={userOptions}>
		<h2 class="title">Are you sure you want to do this action?</h2>
		<span class="list-item">
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
	</Edit>
{/if}

{#if $options.group}
	<Edit handle={groupOptions}>
		<h2 class="title">Are you sure you want to do this action?</h2>
		<span class="list-item">
			{#if option === MemberOptions.LEAVE}
				This group will be removed from your contact list.
			{:else if option === MemberOptions.BLOCKGROUP}
				This group will be removed from your contact list and blocked.
				If you want unblock this user go to Settings > Blocked Users.
			{:else if option === ModOptions.ADD}
				{#if isNotMember(usersValues, $contact).length}
					<p>Add member:</p>
					{#each isNotMember(usersValues, $contact) as member (member.id)}
						<Box bind:prop={groupProps.add} {member} change={addMember} />
					{/each}
				{:else}
					All your contacts are members of this group
				{/if}
			{:else if option === ModOptions.BAN}
				{#if $contact.members.length}
					<p>Ban member:</p>
					{#each $contact.members as member (member.id)}
						<Box bind:prop={groupProps.ban} {member} change={banMember} />
					{/each}
				{:else}
					This group has no contacts
				{/if}
			{:else if option === ModOptions.BLOCK}
				{#if $contact.members.length}
					<p>Block member:</p>
					{#each $contact.members as member (member.id)}
						<Box bind:prop={groupProps.block} {member} change={addMember} />
					{/each}
				{:else}
					This group has no contacts
				{/if}
			{:else if option === ModOptions.UNBLOCK}
				{#if $contact.blacklist.length}
					<p>Unblock member:</p>
					{#each $contact.blacklist as member (member.id)}
						<Box bind:prop={groupProps.unblock} {member} change={banMember} />
					{/each}
				{:else}
					This group has no contacts blocked
				{/if}
			{:else if option === AdminOptions.ADDMOD}
				{#if $contact.members.length}
					<p>Add member:</p>
					{#each $contact.members as member (member.id)}
						<Box bind:prop={groupProps.addMod} {member} change={addMember} />
					{/each}
				{:else}
					All your contacts are members of this group
				{/if}
			{:else if option === AdminOptions.REMOVEMOD}
				{#if $contact.mods.length}
					<p>Remove member:</p>
					{#each $contact.mods as member (member.id)}
						<Box bind:prop={groupProps.removeMod} {member} change={addMember} />
					{/each}
				{:else}
					All your contacts are members of this group
				{/if}
			{:else if option === AdminOptions.AVATAR}
				Load the new image (max. 500KB):
				<label class="label-image">
					<img src={src} alt={$contact.name}>
					<input type="file" name="avatar" on:change={handleAvatar}>
				</label>
			{:else if option === AdminOptions.DESCRIPTION}
				Insert the new description (max. 420 characters):
				<textarea name="description" bind:value={groupProps.description} spellcheck="false" rows="5"></textarea>
			{:else if option === AdminOptions.STATE}
				<p>Choose visibility:</p>
				{#each Object.values(StateOption) as state}
					<label>
						<input
							type="radio"
							name="option"
							on:click={() => groupProps.state = state}
							checked={groupProps.state === state}
						>
						{changeName(state)}
					</label>
				{/each}
				<span>{Messages[groupProps.state]}</span>
			{:else if option === AdminOptions.DESTROY}
				This group will be removed from your contact list and blocked.
				If you want unblock this user go to Settings > Blocked Users.
			{/if}
		</span>
	</Edit>
{/if}

<div class="contact">
	<img src={DIR + avatarURL[$contact.type] + $contact.avatar} alt={$contact.name}>
	<div>
		<h2>{$contact.name}</h2>
		<p>
			{#if typeof $contact.logged === 'boolean'}
				<span class:green={$contact.logged === true}>&#11044;</span>
				{$contact.logged ? 'Connected' : 'Disconnected'}
			{:else}
				<span class='blue'>&#11044;</span>
				{$contact.logged} Connected Users
			{/if}
		</p>
	</div>
	<List bind:visible={visible}>
		{#if $contact.type === Option.USER}
			{#each Object.values(UserOptions) as key}
				<li on:click={() => selectContact(key, Option.USER)} role='none'>
					{UserText[key]}
				</li>
			{/each}
		{/if}
		{#if isMember($contact.members, $user.id) || isMod($contact.mods, $user.id)}
			{#each Object.values(MemberOptions) as key}
				<li on:click={() => selectContact(key, Option.GROUP)} role='none'>
					{GroupText[key]}
				</li>
			{/each}
		{/if}
		{#if isMod($contact.mods, $user.id) || $user.id === $contact.admin}
			{#each Object.values(ModOptions) as key}
				<li on:click={() => selectContact(key, Option.GROUP)} role='none'>
					{GroupText[key]}
				</li>
			{/each}
		{/if}
		{#if $user.id === $contact.admin}
			{#each Object.values(AdminOptions) as key}
				<li on:click={() => selectContact(key, Option.GROUP)} role='none'>
					{GroupText[key]}
				</li>
			{/each}
		{/if}
	</List>
</div>
<Chat bind:option={option} />

<style lang="postcss">
	.list-item {
		background-color: #f3f3f3;
		box-shadow: 0 0 0 2px #999999;
		color: #404040;
		@apply flex flex-wrap justify-between w-full p-2 rounded font-medium;
	}

	.list-item p {
		grid-column: 1 / span 2;
		@apply w-full leading-tight;
	}

	.list-item .label-image {
		@apply w-60 h-60 mt-1.5 mx-auto;
	}

	.list-item img {
		box-shadow: 0 0 2px #777777;
		@apply w-full h-full rounded-full object-cover;
	}

	.list-item textarea {
		outline: 1px solid #b1b1b1;
		@apply w-full mt-1.5 p-2 rounded-lg;
	}

	.list-item label {
		@apply leading-tight;
	}

	.list-item span {
		@apply w-full text-center leading-tight;
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

	.contact li {
		padding: 5px 20px;
		@apply font-bold leading-tight;
	}

	.contact li:hover {
		background-color: #999999;
		color: #ffffff;
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

	.contact img {
		min-width: 40px;
		min-heigth: 40px;
		box-shadow: 0 0 5px #999999;
		@apply w-10 h-10 object-cover rounded-full;
	}
</style>
