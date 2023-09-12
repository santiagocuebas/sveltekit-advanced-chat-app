<script lang="ts">
  import { ButtonValue } from "$lib/types/enums";

  export let selected: string;
  export let text: string;

  function selectedClass() {
    if (text === ButtonValue.CHATS) return 'fa-solid fa-message';
    return 'fa-solid fa-users';
  }
</script>

<button
	class:selected={selected === text}
	title={text}
	on:click={() => selected = text}
><i class={selectedClass()}></i></button>

<style lang="postcss">
  button {
		height: 70px;
		border: 3px solid #888888;
		color: #777777;
		@apply flex relative items-center justify-center w-1/2 font-bold cursor-pointer gap-2;
  }

	i {
		@apply flex items-center justify-center text-2xl leading-none;
	}

	.selected {
		border: 3px solid #3d7cf1;
		color: #3d7cf1;
	}
</style>
