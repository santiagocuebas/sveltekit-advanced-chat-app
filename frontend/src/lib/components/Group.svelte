<script lang="ts">
	import type { IContact, Members } from '$lib/global';
	import { StateOption } from '$lib/enums';
  import { switchs, users } from '$lib/store';
  import { socket } from "$lib/socket";

	let usersValue: IContact[];
	let name = '';
	let mods: Members[] = [];
	let members: Members[] = [];
	let modIDs: string[] = [];
	let memberIDs: string[] = [];
	let state = StateOption.PUBLIC;

	users.subscribe(value => usersValue = value as IContact[]);

	function addMods(id: string, name: string) {
		if (!modIDs.includes(id)) {
			if (memberIDs.includes(id)) {
				memberIDs = memberIDs.filter(memberID => memberID !== id);
				members = members.filter(member => member.id !== id);
			}

			modIDs = [id, ...modIDs];
			return mods = [{ id, name }, ...mods];
		}

		modIDs = modIDs.filter(memberID => memberID !== id);
		return mods = mods.filter(member => member.id !== id);
	}

	function addMembers(id: string, name: string) {
		if (!memberIDs.includes(id) && !modIDs.includes(id)) {
			memberIDs = [id, ...memberIDs];
			return members = [{ id, name }, ...members];
		}

		memberIDs = memberIDs.filter(memberID => memberID !== id);
		return members = members.filter(member => member.id !== id);
	}

	function handleSubmit() {
		socket.emit('createGroup', { name, mods, members, state });
		name = '';
		mods = [];
		members = [];
		modIDs = [];
		memberIDs = [];
		state = StateOption.PUBLIC;
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<button class="close" on:click|preventDefault={() => switchs.resetOptions()}>
		<i class="fa-solid fa-xmark"></i>
	</button>
	<h1>Create Group</h1>
	<div class='select {(name.length > 0 && name.length < 3) || name.length > 40 ? 'error' : ''}'>
		Choice name:
		<input type="text" bind:value={name}>
		{#if name.length > 0 && name.length < 3}
			<p>
				<i class="fa-solid fa-xmark"></i>
				The group name is too short
			</p>
			{:else if name.length > 40}
			<p>
				<i class="fa-solid fa-xmark"></i>
				The group name is too long
			</p>
		{/if}
	</div>
	<div class="select">
		Select moderators:
		<div>
			{#each usersValue as user}
				<span
					class='members {modIDs.includes(user.contactID) ? 'selected' : ''}'
					on:mousedown={addMods(user.contactID, user.name)}
				>{user.name}</span>
			{/each}
		</div>
	</div>
	<div class="select">
		Select members:
		<div>
			{#each usersValue as user}
				<span
					class='members {memberIDs.includes(user.contactID) ? 'selected' : ''}'
					on:mousedown={addMembers(user.contactID, user.name)}
				>{user.name}</span>
			{/each}
		</div>
	</div>
	<div class="select">
		Choose visibility:
		<div class="choise-visibility">
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
		</div>
	</div>
	<button
		class='create {name.length < 3 || name.length > 40 ? 'disabled' : ''}'
		disabled={name.length < 3 || name.length > 40}
	>Create</button>
</form>

<style lang="postcss">
	form {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		background-color: #ffffff;
		scrollbar-width: none;
		z-index: 200;
		@apply grid relative content-start justify-items-center p-2.5 overflow-y-scroll gap-10;
	}

	.close {
		@apply flex absolute items-center justify-center w-9 h-9 top-2.5 right-2.5 font-bold leading-none;
	}

	.close i {
		color: #b2b2b2;
		@apply text-4xl font-bold leading-none cursor-pointer;
	}

	.close i:hover {
		color: #a3a3a3;
	}

	h1 {
		font-size: 40px;
		@apply mt-8;
	}

	.select {
		min-width: 260px;
		@apply grid w-3/5 gap-2;
	}

	input[type='text'], .select div {
		box-shadow: 0 0 0 2px #999999;
		@apply p-1.5 overflow-y-auto overflow-x-hidden;
	}

	.select div {
		height: 120px;
		padding: 10px;
	}

	.members {
		@apply block w-full font-medium leading-tight cursor-context-menu;
	}

	.members:hover {
		background-color: #3d7cf1;
		color: #ffffff;
	}

	.error input {
		box-shadow: 0 0 0 2px #db3333;
	}

	.error p {
		color: #db3333;
		@apply px-2.5 font-bold leading-none;
	}

	.selected {
		background-color: #3d7cf1;
		color: #ffffff;
	}

	.choise-visibility {
		grid-template-columns: repeat(3, 1fr);
		grid-auto-rows: 1fr;
		@apply grid justify-items-center items-center font-medium leading-tight;
	}

	.choise-visibility span {
		grid-column: 1 / span 3;
		text-align: center;
	}

	.create {
		background-color: #3b8fc7;
		color: #ffffff;
		@apply mb-10 py-2.5 px-10 rounded text-xl font-bold leading-none cursor-pointer;
	}

	.create:hover {
		background-color: #2091db;
	}

	.disabled {
		background-color: #d7d7d7;
		color: #666666;
		cursor: default;
	}

	.disabled:hover {
		background-color: #d7d7d7;
	}
</style>
