<script lang="ts">
	import { EditChat as Edit, OptionBox as Box } from "./index";
  import {
		OptionUser,
		OptionMember,
		OptionMod,
		OptionAdmin,
    Messages
	} from "$lib/dictionary";
  import { isNotMember, changeName, loadImage, socketResult } from "$lib/services";
	import { socket } from "$lib/socket";
	import { user, contact, contacts, options, groupProps } from "$lib/store";
	import {
		UserOptions,
		MemberOptions,
		ModOptions,
		AdminOptions,
    StateOption
	} from "$lib/types/enums";

  export let option: string;

	$: avatar = $contact?.avatar;
	
	async function handleDrop(e: DragEvent) {
		if (e.dataTransfer) {
			avatar = await loadImage(e.dataTransfer.files[0]);
			e.dataTransfer.items.clear();
		}
	}

	async function handleImage(this: HTMLInputElement) {
		if (this.files) avatar = await loadImage(this.files[0]);
	}

	function userOptions() {
		if (OptionUser[option] && $contact) {
			socket.emit(OptionUser[option], $contact.contactID, $contact.roomID);

			if (option === UserOptions.BLOCK || option === UserOptions.BAD) {
				user.blockContact({ id: $contact.contactID, name: $contact.name }, 'users');
			}

			contacts.leaveUser($contact.contactID, $contact.roomID);
		}

		options.resetOptions();
	}

	async function groupOptions() {
		if ($contact) {
			const choiceResult = socketResult($contact);
			const data = $groupProps ? $groupProps[option] : undefined;

			if (OptionMember[option]) {
				const result = await choiceResult[option](undefined);
				socket.emit(OptionMember[option], ...result);
				contacts.leaveGroup($contact.contactID);
			} else if (OptionMod[option]) {
				const result = await choiceResult[option](data);
				socket.emit(OptionMod[option], ...result);
			} else if (OptionAdmin[option]) {
				const result = await choiceResult[option](data);
				socket.emit(OptionAdmin[option], ...result);
				if (option === AdminOptions.DESTROY) contacts.leaveGroup($contact.contactID);
			}
		}
		
		options.resetOptions();
	}
</script>


{#if $options.user}
	<Edit on:click={userOptions}>
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
	<Edit on:click={groupOptions}>
		<h2 class="title">
			Are you sure you want to do this action?
		</h2>
		<span class="list-item">
			{#if option === MemberOptions.LEAVE}
				This group will be removed from your contact list.
			{:else if option === MemberOptions.BLOCKGROUP}
				This group will be removed from your contact list and blocked.
				If you want unblock this user go to Settings > Blocked Users.
			{:else if option === ModOptions.ADD}
				{#if isNotMember($contacts.users, $contact).length}
					<p>Add member:</p>
					<ul>
						{#each isNotMember($contacts.users, $contact) as member (member.id)}
							<Box {member} on:click={() => groupProps.addMembers(member)} />
						{/each}
					</ul>
				{:else}
					All your contacts are members of this group
				{/if}
			{:else if option === ModOptions.BAN}
				{#if $contact?.members.length}
					<p>Ban member:</p>
					<ul>
						{#each $contact.members as member (member.id)}
							<Box {member} on:click={() => groupProps.banMembers(member.id)} />
						{/each}
					</ul>
				{:else}
					This group has no contacts
				{/if}
			{:else if option === ModOptions.BLOCK}
				{#if $contact?.members.length}
					<p>Block member:</p>
					<ul>
						{#each $contact.members as member (member.id)}
							<Box {member} on:click={() => groupProps.blockMembers(member)} />
						{/each}
					</ul>
				{:else}
					This group has no contacts
				{/if}
			{:else if option === ModOptions.UNBLOCK}
				{#if $contact?.blacklist.length}
					<p>Unblock member:</p>
					<ul>
						{#each $contact.blacklist as member (member.id)}
							<Box {member} on:click={() => groupProps.unblockMembers(member.id)} />
						{/each}
					</ul>
				{:else}
					This group has no contacts blocked
				{/if}
			{:else if option === AdminOptions.ADDMOD}
				{#if $contact?.members.length}
					<p>Add mods:</p>
					<ul>
						{#each $contact.members as member (member.id)}
							<Box {member} on:click={() => groupProps.addMods(member)} />
						{/each}
					</ul>
				{:else}
					All your contacts are mods of this group
				{/if}
			{:else if option === AdminOptions.REMOVEMOD}
				{#if $contact?.mods.length}
					<p>Remove mods:</p>
					<ul>
						{#each $contact.mods as member (member.id)}
							<Box {member} on:click={() => groupProps.removeMods(member)} />
						{/each}
					</ul>
				{:else}
					None of your contacts are moderators of this group
				{/if}
			{:else if option === AdminOptions.AVATAR}
				<p class="center">Load avatar (max. 500KB):</p>
				<label
					class="label-image"
					on:dragenter|preventDefault={() => {}}
					on:drop|preventDefault={handleDrop}
					on:dragover|preventDefault={() => {}}
				>
					<img src={avatar} alt={$contact?.name}>
					<input type="file" name="avatar" on:change={handleImage}>
				</label>
			{:else if option === AdminOptions.DESCRIPTION}
				<p class="center">Insert the new description (max. 420 characters):</p>
				<textarea
					name="description"
					value={$contact?.description}
					spellcheck="false"
					rows="5"
					on:keyup={groupProps.changeDescription}
				></textarea>
			{:else if option === AdminOptions.STATE}
				<p>Choose visibility:</p>
				<div>
					{#each Object.values(StateOption) as state}
						<label>
							<input
								type="radio"
								name="option"
								value={state}
								checked={$groupProps?.state === state}
								on:click={() => groupProps.changeState(state)}
							>
							{changeName(state)}
						</label>
					{/each}
					<span>
						{Messages[$groupProps?.state ?? 'public']}
					</span>
				</div>
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
		@apply flex flex-col items-center justify-center w-full p-2 bg-white rounded aspect-square text-center font-semibold;

    & div {
      @apply flex flex-wrap justify-center w-full m-auto text-center leading-tight gap-x-2;
    }
	}

	p {
		grid-column: 1 / span 2;
		@apply self-start w-full text-start leading-tight [&.center]:text-center;
	}

	ul {
		scrollbar-width: none;
		@apply flex flex-wrap content-start justify-between w-full h-[calc(100%-20px)] aspect-auto overflow-auto;
	}

	img {
		box-shadow: 0 0 2px #777777;
		@apply w-full h-full rounded-full object-cover;
	}

	textarea {
		outline: none;
		@apply w-full h-[calc(100%-40px)] pt-2 text-center font-medium;
	}

	label {
		@apply flex flex-none flex-wrap items-center leading-tight gap-x-1.5;

    &.label-image {
      @apply w-[90%] mt-auto mx-auto aspect-square;
    }
	}
</style>
