<script lang="ts">
  import type { IForeign, IGroupProps } from "$lib/types/global";
  import { onDestroy } from "svelte";
	import { EditChat as Edit } from "./index";
  import { DIR } from "$lib/config";
  import {
		OptionUser,
		OptionMember,
		OptionMod,
		OptionAdmin,
    Messages
	} from "$lib/dictionary";
	import { socket } from "$lib/socket";
  import { leaveUser, leaveGroup } from '$lib/sockets';
	import { user, contact, options, users } from "$lib/store";
  import { isNotMember, addMember, banMember } from "$lib/services/chat-libs";
  import { changeName, sendAvatar } from "$lib/services/libs";
  import { socketResult } from "$lib/services/socket-result";
	import {
		UserOptions,
		MemberOptions,
		ModOptions,
		AdminOptions,
    StateOption,
    Formats
	} from "$lib/types/enums";

  export let option: string;
	export let groupProps: IGroupProps;

	let usersValues: IForeign[];
	let socketFile: File;

	$: src = DIR + '/' + $contact.avatar;
	
	const unsubUsers = users.subscribe(value => usersValues = value as IForeign[]);

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

	function userOptions() {
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
						<li>
							{member.name}
							<input
								type="checkbox"
								on:click={() => groupProps.add = addMember(member, groupProps.add)}
							>
						</li>
					{/each}
				{:else}
					All your contacts are members of this group
				{/if}
			{:else if option === ModOptions.BAN}
				{#if $contact.members.length}
					<p>Ban member:</p>
					{#each $contact.members as member (member.id)}
						<li>
							{member.name}
							<input
								type="checkbox"
								on:click={() => groupProps.ban = banMember(member, groupProps.ban)}
							>
						</li>
					{/each}
				{:else}
					This group has no contacts
				{/if}
			{:else if option === ModOptions.BLOCK}
				{#if $contact.members.length}
					<p>Block member:</p>
					{#each $contact.members as member (member.id)}
						<li>
							{member.name}
							<input
								type="checkbox"
								on:click={() => groupProps.block = addMember(member, groupProps.block)}
							>
						</li>
					{/each}
				{:else}
					This group has no contacts
				{/if}
			{:else if option === ModOptions.UNBLOCK}
				{#if $contact.blacklist.length}
					<p>Unblock member:</p>
					{#each $contact.blacklist as member (member.id)}
						<li>
							{member.name}
							<input
								type="checkbox"
								on:click={() => groupProps.unblock = banMember(member, groupProps.unblock)}
							>
						</li>
					{/each}
				{:else}
					This group has no contacts blocked
				{/if}
			{:else if option === AdminOptions.ADDMOD}
				{#if $contact.members.length}
					<p>Add member:</p>
					{#each $contact.members as member (member.id)}
						<li>
							{member.name}
							<input
								type="checkbox"
								on:click={() => groupProps.addMod = addMember(member, groupProps.addMod)}
							>
						</li>
					{/each}
				{:else}
					All your contacts are mods of this group
				{/if}
			{:else if option === AdminOptions.REMOVEMOD}
				{#if $contact.mods.length}
					<p>Remove member:</p>
					{#each $contact.mods as member (member.id)}
						<li>
							{member.name}
							<input
								type="checkbox"
								on:click={() => groupProps.removeMod = addMember(member, groupProps.removeMod)}
							>
						</li>
					{/each}
				{:else}
					None of your contacts are moderators of this group
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

<style lang="postcss">
  .list-item {
		box-shadow: 0 0 0 2px #999999;
		@apply flex flex-none flex-wrap justify-between w-full p-2 bg-[#f3f3f3] rounded font-medium text-[#404040];

    & span {
      @apply w-full text-center leading-tight;
    }
	}

	p {
		grid-column: 1 / span 2;
		@apply w-full leading-tight;
	}

	img {
		box-shadow: 0 0 2px #777777;
		@apply w-full h-full rounded-full object-cover;
	}

	textarea {
		outline: 1px solid #b1b1b1;
		@apply w-full mt-1.5 p-2 rounded-lg;
	}

	label {
		@apply leading-tight;

    &.label-image {
      @apply aspect-square mt-1.5 mx-auto;
    }
	}

	li {
		@apply flex relative w-[48%] h-min max-h-5 overflow-hidden text-ellipsis leading-tight;
	}

	input[type='checkbox'] {
		@apply absolute self-center right-0;
	}
</style>
