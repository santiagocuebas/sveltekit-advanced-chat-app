<script lang="ts">
	import type { Member } from "$lib/types/global";

	export let member: Member;
	export let name = '';
</script>

<li>
	<p>{member.name}</p>
	<input type="checkbox" name={name} value={member.id} on:click>
</li>

<style lang="postcss">
	li {
		grid-template-columns: 1fr 20px;
		@apply self-start grid relative items-center w-[48%] font-medium gap-1;
	}

	p {
		@apply max-w-full text-left overflow-hidden text-ellipsis leading-tight;
	}

	input[type='checkbox'] {
		@apply self-center justify-self-start;
	}
</style>
