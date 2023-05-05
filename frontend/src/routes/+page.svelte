<script lang="ts">
  import type { LayoutServerData } from './$types';
  import { onMount } from 'svelte';
  import io from 'socket.io-client';
  import { DIR } from '$lib/config.js';
  import Register from '$lib/components/Register.svelte';

  export let data: LayoutServerData;

  const socket = io(DIR, { withCredentials: true });
  let message = 'No estas connectado';

  onMount(() => {
    socket.on('hola', (receiveMessage: string) => message = receiveMessage);

    return () => {
      socket.off('hola', (receiveMessage: string) => message = receiveMessage);
    }
  });
</script>

{#if data.logged}
  {message}
  {:else}
  <Register bind:logged={data.logged} />
{/if}
