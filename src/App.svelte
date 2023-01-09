<script lang="ts">
  import Chatboard from "./lib/Chatboard.svelte";
  import Login from "./lib/Login.svelte";
  import { currentUser } from "./lib/pocketbase";
</script>

<div class="h-[90vh] mx-6 md:mx-10 rounded-lg">
  {#if $currentUser}
    <div class="h-full relative">
      <Chatboard />
    </div>
  {:else}
    <Login />
  {/if}
</div>
