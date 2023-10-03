<script lang="ts">
	import type { Member } from "$lib/types/global";

	export let prop: string[] | Member[];
	export let name: string = '';
	export let value: string = '';
	export let member: Member;
	export let change: any;
</script>

<li>
	{member.name}
	<input
		type="checkbox"
		name={name}
		value={value}
		on:click={() => prop = change(member, prop)}
	>
</li>

<style lang="postcss">
	li {
		width: 48%;
		max-height: 20px;
		@apply flex relative h-min overflow-hidden text-ellipsis leading-tight;
	}

	input[type='checkbox'] {
		@apply absolute self-center right-0;
	}
</style>
