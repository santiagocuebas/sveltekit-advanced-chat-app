<script lang="ts">
	import { afterUpdate } from 'svelte';
	import { changeName } from '$lib/services';
  import { emailInput, passInput } from '$lib/store';

	const arrayOfInputs = ['email', 'password'];

	afterUpdate(emailInput.checkActive);
	afterUpdate(passInput.checkActive);
</script>

<div>
	<label class={$emailInput.class}>
		<p>
			{changeName(arrayOfInputs[0])}
		</p>
		<input
			type='text'
			name={arrayOfInputs[0]}
			value={$emailInput.value}
			autocomplete="off"
			on:keyup={emailInput.setInput}
			on:focus={emailInput.changeClass}
			on:blur={emailInput.changeError}
		>
	</label>
	{#if $emailInput.error}
		<div>
			<i class="fa-solid fa-xmark"></i>
			{$emailInput.error}
		</div>
	{/if}
</div>
<div>
	<label class={$passInput.class}>
		<p>
			{changeName(arrayOfInputs[1])}
		</p>
		<input
			type='password'
			name={arrayOfInputs[1]}
			value={$passInput.value}
			autocomplete="off"
			on:keyup={passInput.setInput}
			on:focus={passInput.changeClass}
			on:blur={passInput.changeError}
		>
	</label>
	{#if $passInput.error}
		<div>
			<i class="fa-solid fa-xmark"></i>
			{$passInput.error}
		</div>
	{/if}
</div>

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
		outline: none;
		@apply h-0 w-full transition-all delay-0;
	}
</style>
