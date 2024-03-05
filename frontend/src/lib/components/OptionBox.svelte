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
	<p>{member.name}</p>
	<input
		type="checkbox"
		name={name}
		value={value}
		on:click={() => prop = change(member, propReact)}
	>
</li>

<style lang="postcss">
	li {
		grid-template-columns: 1fr 20px;
		@apply grid relative items-center w-[48%] gap-1;
	}

	p {
		@apply max-w-full overflow-hidden text-ellipsis leading-tight;
	}

	input[type='checkbox'] {
		@apply self-center justify-self-start;
	}
</style>
