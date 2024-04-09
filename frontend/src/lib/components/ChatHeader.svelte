<script lang="ts">
	import { List } from "./index";
  import { DIR } from "$lib/config";
  import { UserText, GroupText } from "$lib/dictionary";
  import { isMember, isMod } from "$lib/services";
	import { user, contact, options, groupProps } from "$lib/store";
	import {
		UserOptions,
		MemberOptions,
		ModOptions,
		AdminOptions,
    Option
	} from "$lib/types/enums";

	export let option = '';

	let visible = false;

	function selectContact(value: string, key: string) {
		if (key === Option.GROUP && $contact) groupProps.setProps($contact);
		visible = false;
		option = value;
		options.setOption(key);
	}
</script>

<div class="contact">
	<picture>
		<img src={DIR + '/' + $contact?.avatar} alt={$contact?.name}>
	</picture>
	<div>
		<h2>{$contact?.name}</h2>
		<p>
			<span
				class:green={$contact?.logged === true}
				class:blue={$contact?.logged instanceof Array}
			>&#11044;</span>
			{#if typeof $contact?.logged === 'boolean'}
				{$contact?.logged ? 'Connected' : 'Disconnected'}
			{:else}
				{$contact?.logged.length} Connected Users
			{/if}
		</p>
	</div>
	<List bind:visible={visible}>
		{#if $contact?.type === Option.USER}
			{#each Object.values(UserOptions) as key}
				<li on:click={() => selectContact(key, Option.USER)} role='none'>
					{UserText[key]}
				</li>
			{/each}
		{/if}
		{#if isMember($contact?.members, $user.id) || isMod($contact?.mods, $user.id)}
			{#each Object.values(MemberOptions) as key}
				<li on:click={() => selectContact(key, Option.GROUP)} role='none'>
					{GroupText[key]}
				</li>
			{/each}
		{/if}
		{#if isMod($contact?.mods, $user.id) || $user.id === $contact?.admin}
			{#each Object.values(ModOptions) as key}
				<li on:click={() => selectContact(key, Option.GROUP)} role='none'>
					{GroupText[key]}
				</li>
			{/each}
		{/if}
		{#if $user.id === $contact?.admin}
			{#each Object.values(AdminOptions) as key}
				<li on:click={() => selectContact(key, Option.GROUP)} role='none'>
					{GroupText[key]}
				</li>
			{/each}
		{/if}
	</List>
</div>

<style lang="postcss">
	.contact {
		grid-column: 2 / span 1;
		grid-row: 1 / span 1;
		@apply flex w-full p-2.5 bg-[#e7e7e7] overflow-hidden gap-x-2.5 [&_div]:overflow-hidden;
	}

	picture {
		@apply w-10 h-10;
	}

	img {
		box-shadow: 0 0 4px #999999;
		@apply w-full h-full object-cover rounded-full;
	}

	h2 {
		@apply h-5 overflow-hidden text-ellipsis text-[20px] font-semibold;
	}

	p {
		@apply flex h-5 overflow-hidden text-ellipsis font-medium text-[#444444] leading-tight gap-1;
	}

	span {
		@apply self-center text-[8px] [&.green]:text-[#1e9224] [&.blue]:text-[#62bdf1];
	}

	li {
		@apply py-[5px] px-[20px] font-bold leading-tight hover:bg-[#999999] hover:text-white;
	}
</style>
