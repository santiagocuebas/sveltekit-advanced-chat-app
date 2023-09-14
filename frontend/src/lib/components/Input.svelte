<script lang="ts">
  import type { Check } from "$lib/types/global";
  import { afterUpdate } from "svelte";

	export let text: string;
	export let name: string;
	export let type: string;
	export let input: string;
	export let error: string | undefined;
	export let pass: string | undefined = undefined;
	export let active: boolean;
	export let check: Check;

	let selectClass = '';

	const changeClass = () => {
		if (!error) selectClass = 'focus';
	};

	const changeError = () => {
		if (!input.length) {
			error = undefined;
			selectClass = '';
		}
	};

	function setInput(this: HTMLInputElement) {
		input = this.value;

		if (name === 'confirmPassword') error = check(input, undefined, pass);
		else error = check(input);

		if (error) selectClass = 'error';
		else selectClass = 'focus';
	}

	afterUpdate(() => {
		if (active) {
			selectClass = 'error';
			active = false;
		}
	});
</script>

{#if (name !== 'confirmPassword' || pass)}
	<div>
		<label class={selectClass}>
			<p>{text}</p>
			<input
				type={type}
				name={name}
				value={input}
				autocomplete="off"
				on:keyup={setInput}
				on:focus={changeClass}
				on:blur={changeError}
			>
		</label>
		{#if error}
			<div>
				<i class="fa-solid fa-xmark"></i>
				{error}
			</div>
		{/if}
	</div>
{/if}

<style lang="postcss">
	div {
		min-width: 300px;
		max-width: 600px;
		@apply w-1/2;
	}

	label {
		transition: all 0.1s;
		gap: 5px;
		@apply flex flex-wrap w-full h-14 p-2 rounded shadow-ligthgrey;
	}

	p {
		transition: all 0.1s;
		@apply w-full text-darkgrey text-xl font-normal leading-loose select-none;
	}

	input {
		transition: all 0s;
		@apply h-0 w-full;
	}

	div div {
		color: #df3c3c;
		@apply flex items-center w-full pl-2.5 py-0.5 font-bold gap-1;
	}

	div i {
		@apply self-start text-xl leading-tight;
	}

	.focus {
		box-shadow: 0 0 0 2px #4288d8;
	}

	.focus p {
		font-size: 14px;
		line-height: 1.071;
		color: #4288d8;
		@apply font-semibold;
	}

	.error {
		box-shadow: 0 0 0 2px #df3c3c;
		@apply flex-wrap;
	}

	.error p {
		font-size: 14px;
		line-height: 1.071;
		color: #df3c3c;
		@apply font-semibold;
	}

	.focus input, .error input {
		height: 20px;
		transition-delay: 0.1s;
	}
</style>
