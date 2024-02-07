<script lang="ts">
	import type { Member } from '$lib/types/global';
  import { Messages } from '$lib/dictionary';
  import { socket } from "$lib/socket";
  import { switchs, users } from '$lib/store';
  import { isMember, isMod } from '$lib/services/chat-libs';
  import { changeName } from '$lib/services/libs';
	import { StateOption } from '$lib/types/enums';

	let name = '';
	let mods: Member[] = [];
	let members: Member[] = [];
	let state = StateOption.PUBLIC;

	function addMods(id: string, name: string) {
		mods = (!isMod(mods, id) && !isMember(members, id))
			? [{ id, name }, ...mods]
			: mods.filter(mods => mods.id !== id);
	}

	function addMembers(id: string, name: string) {
		members = (!isMember(members, id) && !isMod(mods, id))
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
		<div class:error={(name.length > 0 && name.length < 3) || name.length > 40}>
			Choice name:
			<input type="text" bind:value={name}>
			{#if (name.length > 0 && name.length < 3) || name.length > 40}
				<p>
					<i class="fa-solid fa-xmark"></i>
					The name is too {name.length > 40 ? 'long' : 'short'}
				</p>
			{/if}
		</div>
		<div>
			Select moderators:
			<ul>
				{#each $users as { contactID, name } (contactID)}
					<li
						class:selected={isMod(mods, contactID)}
						class:disabled={isMember(members, contactID)}
						on:click={() => addMods(contactID, name)}
						role='none'
					>{name}</li>
				{/each}
			</ul>
		</div>
		<div>
			Select members:
			<ul>
				{#each $users as { contactID, name } (contactID)}
					<li
						class:selected={isMember(members, contactID)}
						class:disabled={isMod(mods, contactID)}
						on:click={() => addMembers(contactID, name)}
						role='none'
					>{name}</li>
				{/each}
			</ul>
		</div>
		<div>
			Choose visibility:
			<span class="choise-visibility">
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
			</span>
		</div>
		<div>
			<button class='create' disabled={name.length < 3 || name.length > 40}>
				Create
			</button>
		</div>
	</form>
</div>

<style lang="postcss">
	h1 {
		@apply text-[40px];
	}

	form {
		@apply flex flex-wrap h-full content-between justify-center gap-y-10;

		& div {
			@apply grid w-3/5 min-w-[280px] gap-2;

			&.error input {
				box-shadow: 0 0 0 2px #db3333;
			}

			&.error p {
				@apply px-2.5 font-bold text-[#db3333] leading-none;
			}
		}

		& ul, input[type='text'] {
			box-shadow: 0 0 0 2px #999999;
			@apply p-1.5 overflow-y-auto overflow-x-hidden;
		}

		& ul {
			@apply h-[120px] p-2.5;
		}

		& li {
			@apply block w-full font-medium leading-tight cursor-pointer select-none;
			
			.selected {
				@apply bg-[#3d7cf1] text-white;
			}

			.disabled {
				@apply bg-[#d7d7d7] text-[#666666];
			}
		}
	}

	.choise-visibility {
		grid-template-columns: repeat(3, 1fr);
		grid-auto-rows: min-content;
		@apply grid justify-items-center font-medium leading-tight gap-y-2;

		& span {
			grid-column: 1 / span 3;
			@apply text-center;
		}
	}

	.create {
		@apply self-end justify-self-center w-min h-min py-2.5 px-10 bg-[#3b8fc7] rounded text-[20px] text-white font-bold hover:bg-[#2091db];

		&[disabled] {
			@apply bg-[#d7d7d7] text-[#666666] cursor-default hover:bg-[#d7d7d7];
		}
	}
</style>
