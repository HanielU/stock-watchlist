<script lang="ts">
  import "@unocss/reset/tailwind.css"; // https://github.com/unocss/unocss#style-resetting
  import "uno.css"; // https://github.com/unocss/unocss/tree/main/packages/vite#installation
  import Header from "./components/Header.svelte";
  import type { PageData } from "./$types";
  import SearchStocks from "./components/SearchStocks.svelte";

  export let data: PageData;
  let showSearch = false;
</script>

<div class="relative font-sans h-full">
  {#if data.user}
    <Header on:search={() => (showSearch = true)} />
  {/if}

  <slot />

  {#if showSearch}
    <SearchStocks on:close={() => (showSearch = false)} />
  {/if}
</div>

<svelte:head>
  <title>Stock Watchlist App</title>
</svelte:head>
