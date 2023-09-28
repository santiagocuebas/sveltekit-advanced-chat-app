<script lang="ts">
	import type { Members } from '$lib/types/global';
  import { Messages } from '$lib/dictionary';
  import { socket } from "$lib/socket";
  import { isMember, isMod } from '$lib/services/chat-libs';
  import { changeName } from '$lib/services/libs';
  import { switchs, users } from '$lib/store';
	import { StateOption } from '$lib/types/enums';

	let name = '';
	let mods: Members[] = [];
	let members: Members[] = [];
	let state = StateOption.PUBLIC;

	function addMods(id: string, name: string, mods: Members[], members: Members[]) {
		if (!isMod(mods, id)) {
			if (isMember(members, id)) {
				members = members.filter(member => member.id !== id);
			}

			mods = [{ id, name }, ...mods];
		} else mods = mods.filter(member => member.id !== id);

		return [mods, members];
	}

	function addMembers(id: string, name: string, members: Members[]) {
		return (!isMember(members, id) && !isMod(mods, id))
			? [{ id, name }, ...members]
			: members.filter(member => member.id !== id);
	}

	function handleSubmit() {
		socket.emit('createGroup', { name, mods, members, state });
		name = '';
		mods = [];
		members = [];
		state = StateOption.PUBLIC;
	}
</script>

<div class="container-box">
	<button class="close" on:click={() => switchs.resetOptions()}>
		<i class="fa-solid fa-xmark"></i>
	</button>
	<h1>Create Group</h1>
	<form on:submit|preventDefault={handleSubmit}>
		<div class='select {(name.length > 0 && name.length < 3) || name.length > 40 ? 'error' : ''}'>
			Choice name:
			<input type="text" bind:value={name}>
			{#if (name.length > 0 && name.length < 3) || name.length > 40}
				<p>
					<i class="fa-solid fa-xmark"></i>
					The name is too {name.length > 40 ? 'long' : 'short'}
				</p>
			{/if}
		</div>
		<div class="select">
			Select moderators:
			<ul>
				{#each $users as { contactID, name } (contactID)}
					<li
						class:selected={isMod(mods, contactID)}
						on:click={() => [mods, members] = addMods(contactID, name, mods, members)}
						role='none'
					>{name}</li>
				{/each}
			</ul>
		</div>
		<div class="select">
			Select members:
			<ul>
				{#each $users as { contactID, name } (contactID)}
					<li
						class:selected={isMember(members, contactID)}
						on:click={() => members = addMembers(contactID, name, members)}
						role='none'
					>{name}</li>
				{/each}
			</ul>
		</div>
		<div class="select">
			Choose visibility:
			<div class="choise-visibility">
				{#each Object.values(StateOption) as option}
					<label>
						<input
							type="radio"
							name="option"
							on:click={() => state = option}
							checked={state === option}
						>
						{changeName(option)}
					</label>
				{/each}
				<span>{Messages[state]}</span>
			</div>
		</div>
		<div class="select">
			<button class='create' disabled={name.length < 3 || name.length > 40}>
				Create
			</button>
		</div>
	</form>
</div>

<style lang="postcss">
	h1 {
		font-size: 40px;
	}

	form {
		@apply flex flex-wrap h-full content-between justify-center gap-y-10;
	}

	.select {
		min-width: 280px;
		@apply grid w-3/5 gap-2;
	}

	input[type='text'], .select ul {
		box-shadow: 0 0 0 2px #999999;
		@apply p-1.5 overflow-y-auto overflow-x-hidden;
	}

	.select ul {
		height: 120px;
		padding: 10px;
	}

	.select li {
		@apply block w-full font-medium leading-tight cursor-context-menu;
	}

	.select li:hover {
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
		@apply grid justify-items-center items-center font-medium leading-tight gap-y-2;
	}

	.choise-visibility span {
		grid-column: 1 / span 3;
		text-align: center;
	}

	.create {
		background-color: #3b8fc7;
		color: #ffffff;
		@apply justify-self-center w-min h-min py-2.5 px-10 rounded text-xl font-bold leading-none cursor-pointer;
	}

	.create:hover {
		background-color: #2091db;
	}

	.create[disabled] {
		background-color: #d7d7d7;
		color: #666666;
		cursor: default;
	}

	.create[disabled]:hover {
		background-color: #d7d7d7;
	}
</style>
