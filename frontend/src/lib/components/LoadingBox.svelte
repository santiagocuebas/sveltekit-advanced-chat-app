<script lang="ts">
  export let className: string;
</script>

<div class={className}>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
    <g>
      <circle cx="13.792" cy="3.082" r="3.082"/>
      <circle cx="13.792" cy="24.501" r="1.849"/>
      <circle cx="6.219" cy="6.218" r="2.774"/>
      <circle cx="21.365" cy="21.363" r="1.541"/>
      <circle cx="3.082" cy="13.792" r="2.465"/>
      <circle cx="24.501" cy="13.791" r="1.232"/>
      <path d="M4.694,19.84c-0.843,0.843-0.843,2.207,0,3.05c0.842,0.843,2.208,0.843,3.05,0c0.843-0.843,0.843-2.207,0-3.05 C6.902,18.996,5.537,18.988,4.694,19.84z"/>
      <circle cx="21.364" cy="6.218" r="0.924"/>
    </g>
  </svg>
  <h1>
    Loading
  </h1>
</div>

<style lang="postcss">
	.main-loading {
		grid-auto-rows: min-content;
		grid-column: 1 / span 2;
		grid-row: 1 / span 3;
		@apply grid relative justify-items-center content-center w-full py-5 bg-white gap-5;
	}
  
  .box-loading {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		@apply flex flex-col items-center justify-center w-full h-full py-5 bg-white gap-2;
		
		& svg {
			@apply flex-none w-[250px] h-[250px];
		}
	}

  svg {
		animation: spin 4s linear infinite;
		@apply w-[300px] h-[300px] rounded-full;
	}

  h1 {
    @apply font-medium text-[56px];
  }

	@keyframes spin { 
    100% { 
      transform: rotate(360deg); 
  	}
	}
</style>
