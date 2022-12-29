<script lang="ts">
  import { enhance } from "$app/forms";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  const openSearch = () => dispatch("search");
</script>

<header
  class="w-full z-999 bg-white shadow-(md neutral-100/80) sticky top-0 left-0 text-(2xl neutral-600) mb-5"
>
  <div class="p-(y3 x4) flex-u-between w-full max-w-6xl mx-auto">
    <div class="flex-u-between">
      <!-- icon wrapper -->
      <div class="mr-2">
        <div class="i-logos-svelte-icon" />
      </div>

      <h3 class="text-xl">Stock Tracker</h3>
    </div>

    <!-- :fix: logout not working -->
    <form class="m-(l-auto r3) flex" use:enhance method="POST" action="/auth?/logout">
      <button class="text-(xs white) p-(y1 x1.5) rounded-md bg-red-800"> logout </button>
    </form>

    <!-- icon wrapper -->
    <button class="flex" on:click={openSearch}>
      <div class="i-mdi-magnify transition text-neutral-300 hover:text-neutral-600" />
    </button>
  </div>
</header>
