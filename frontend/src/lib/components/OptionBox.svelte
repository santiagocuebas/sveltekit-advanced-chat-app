<script lang="ts">
	import type { Members } from "$lib/types/global";

	export let prop: string[] | Members[];
	export let name: string = '';
	export let member: Members;
	export let change: any;
</script>

<li>
	{member.name}
	<input type="checkbox" name={name} on:click={() => prop = change(member, prop)}>
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
