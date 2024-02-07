<script lang="ts">
	import type { Member } from "$lib/types/global";

	export let prop: string[] | Member[];
	export let name: string = '';
	export let value: string = '';
	export let member: Member;
	export let change: ((member: Member, prop: string[]) => string[]) | ((member: Member, prop: Member[]) => Member[]);

	$: propReact = prop as string[] & Member[];
</script>

<li>
	{member.name}
	<input
		type="checkbox"
		name={name}
		value={value}
		on:click={() => prop = change(member, propReact)}
	>
</li>

<style lang="postcss">
	li {
		@apply flex relative w-[48%] h-min max-h-5 overflow-hidden text-ellipsis leading-tight;
	}

	input[type='checkbox'] {
		@apply absolute self-center right-0;
	}
</style>
