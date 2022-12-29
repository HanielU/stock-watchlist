<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import { iexSymbols, watchListStore } from "$lib/stores";

  const dispatch = createEventDispatcher();
  const closeSearch = () => dispatch("close");
  // molly on the way, bitches in the way (globetrotter)

  let searchValue = "";
  let filtered: any[] = [];
  let manageStockId: string | null = null;

  $: watchlists = [...$watchListStore?.values()];
  $: symbols = $iexSymbols ? [...$iexSymbols?.values()] : [];
  $: autoComplete(searchValue);

  const focusSearch = (node: HTMLInputElement) => node.focus();

  function autoComplete(search: string) {
    if (search.length < 1) {
      filtered = [];
      return;
    }

    const localFiltered = [];
    // a regular for loop is better performance
    for (let i = 0; i < symbols.length; i++) {
      if (symbols?.[i].symbol.startsWith(search.toUpperCase())) {
        localFiltered.push(symbols[i]);
      }
    }
    filtered = localFiltered.length > 0 ? localFiltered.slice(0, 5) : [];
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="absolute top-0 left-0 h-full w-full bg-neutral-200/50 z-999"
  transition:fade={{ duration: 100 }}
  on:click|self={closeSearch}
>
  <!-- search bar -->
  <div
    class="bg-white w-full p-(x-5 y-2) flex-u-between gap-5 text-neutral-900 mb-5 max-w-6xl mx-auto"
  >
    <input
      class="py-3 flex-1 outline-none"
      type="text"
      placeholder="Search"
      use:focusSearch
      bind:value={searchValue}
    />
    <button
      class="bg-neutral-200 font-semibold text-xs p-(x-2 y-1.5) rounded-md"
      on:click={closeSearch}
    >
      Cancel
    </button>
  </div>

  <!-- search results -->
  <div class="w-full p-5 bg-white max-w-6xl mx-auto px-5">
    {#each filtered as symbol (symbol.symbol)}
      <div class="w-full mb-5">
        <div class="flex gap-5 w-full">
          <div class="w-10 h-10 bg-neutral-200 rounded-md" />

          <div class="flex flex-col gap-1">
            <div class="font-semibold text-neutral-900">{symbol?.symbol}</div>
            <div class="text-neutral-600">{symbol?.name}</div>
          </div>

          <div class="flex-u-center ml-auto text-(white xs)">
            {#if watchlists
              .map(w => w.stockquotes)
              .flat()
              .find(s => s.symbol === symbol.symbol)}
              <button
                class="bg-green-600 rounded-lg p-(y1.5 x2)"
                on:click={() => (manageStockId = symbol.symbol)}
              >
                Manage Stock
              </button>
            {:else}
              <button
                class="bg-blue-600 rounded-lg p-(y1.5 x2)"
                on:click={() => (manageStockId = symbol.symbol)}
              >
                Add To Watchlist
              </button>
            {/if}
          </div>
        </div>

        <div class="text-(white xs) flex-u-start gap-2 p2">
          {#if manageStockId == symbol.symbol}
            {#each watchlists as { name, id, stockquotes } (id)}
              {#if stockquotes.find(s => s.symbol === symbol.symbol)}
                <button
                  class="bg-orange-500 rounded-sm p-2"
                  on:click={() => watchListStore.removeSymbolFromWatchlist(id, symbol.symbol)}
                >
                  Remove From {name}
                </button>
              {:else}
                <button
                  class="bg-green-500 rounded-sm p-2"
                  on:click={() => watchListStore.addSymbolToWatchlist(id, symbol.symbol)}
                >
                  {name}
                </button>
              {/if}
            {/each}
          {/if}
        </div>
      </div>
    {:else}
      <div class="text-center text-neutral-600">No results found</div>
    {/each}
  </div>
</div>
