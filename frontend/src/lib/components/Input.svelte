<script lang="ts">
  import type { Check } from "$lib/types/global";
  import { afterUpdate } from "svelte";
  import { Inputs } from "$lib/types/enums";

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
		error = name === Inputs.CONFIRM ? check(input, undefined, pass) : check(input);
		selectClass = error ? 'error' : 'focus';
	}

	afterUpdate(() => {
		if (active) {
			selectClass = 'error';
			active = false;
		}
	});
</script>

{#if (name !== Inputs.CONFIRM || pass)}
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
		@apply w-1/2 min-w-[300px] max-w-[600px];

		& div {
			@apply flex items-center w-full pl-2.5 py-0.5 font-bold text-[#df3c3c] gap-1;
		}

		& i {
			@apply self-start text-xl leading-tight;
		}
	}

	label {
		box-shadow: 0 0 0 1px #aaaaaa;
		@apply flex flex-wrap w-full h-14 p-2 rounded gap-[5px] transition-all delay-100;

		&.focus {
			box-shadow: 0 0 0 2px #4288d8;

			& p {
				@apply text-[14px] font-semibold text-[#4288d8] leading-[1.071];
			}
		}

		&.error {
			box-shadow: 0 0 0 2px #df3c3c;
			@apply flex-wrap;
			
			& p {
				@apply text-[14px] font-semibold text-[#df3c3c] leading-[1.071];
			}
		}

		&.focus input, &.error input {
			@apply h-5 delay-100;
		}
	}

	p {
		@apply w-full text-xl font-normal text-[#222222] leading-loose select-none transition-all delay-100;
	}

	input {
		@apply h-0 w-full transition-all delay-0;
	}
</style>
