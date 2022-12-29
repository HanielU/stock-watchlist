<script lang="ts">
  import { watchListStore } from "$lib/stores";
  import StocksTable from "./components/StocksTable.svelte";
  import StockDetailsView from "./components/StockDetailsView.svelte";

  let newWatchListName = "";
  let creatingWatchlist = false;
  let editWatchListId: string | null = null;
  let editedWatchListName = "";
  let stockDetailsSymbol = "";
</script>

<div class="max-w-6xl mx-auto px-5">
  <div mb-5>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-(y2 x4) rounded"
      on:click={() => (creatingWatchlist = true)}
    >
      Create Watchlist
    </button>

    {#if creatingWatchlist}
      <div class="flex gap-5 mt-5">
        <input
          class="py-3 px-5 flex-1 outline-none"
          type="text"
          placeholder="Watchlist Name"
          bind:value={newWatchListName}
        />

        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-(y1.5 x2) rounded"
          on:click={() => {
            watchListStore.createWatchList(newWatchListName);
            newWatchListName = "";
            creatingWatchlist = false;
          }}
        >
          Create
        </button>
        <button
          class="bg-red-500 hover:bg-red-700 text-white font-bold p-(y1.5 x2) rounded"
          on:click={() => {
            newWatchListName = "";
            creatingWatchlist = false;
          }}
        >
          Cancel
        </button>
      </div>
    {/if}
  </div>

  <div>
    {#each [...$watchListStore.values()] as { name, stockquotes, id } (id)}
      <div class="mb-8 last:pb-5">
        <!-- watchlist header -->
        <header class="flex-u-between mb-3">
          {#if editWatchListId === id}
            <input
              class="py-3 px-5 flex-1 outline-none text-neutral-800"
              type="text"
              placeholder="Watchlist Name"
              bind:value={editedWatchListName}
            />

            <button
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-(y1.5 x2) rounded"
              on:click={async () => {
                await watchListStore.updateWatchList(id, editedWatchListName);
                editWatchListId = null;
                editedWatchListName = "";
              }}
            >
              Save
            </button>
            <button
              class="bg-red-500 hover:bg-red-700 text-white font-bold p-(y1.5 x2) rounded"
              on:click={() => {
                editWatchListId = null;
                editedWatchListName = "";
              }}
            >
              Cancel
            </button>
          {:else if editWatchListId == null}
            <h3 class="font-semibold text-neutral-800 capitalize">{name}</h3>

            <button
              class="bg-orange-500 p-(y1 x2) text-(sm white) rounded-lg m-(l-auto r-5)"
              on:click={() => {
                editedWatchListName = name;
                editWatchListId = id;
              }}
            >
              Edit
            </button>
            <button
              class="bg-orange-500 p-(y1 x2) text-(sm white) rounded-lg"
              on:click={() => watchListStore.deleteWatchList(id)}>Delete</button
            >
          {/if}
        </header>

        <StocksTable
          watchlistData={stockquotes}
          on:show-details={e => (stockDetailsSymbol = e.detail)}
          on:delete={e => watchListStore.removeSymbolFromWatchlist(id, e.detail)}
        />
      </div>
    {:else}
      <div class="text-center text-neutral-500">No watchlists yet</div>
    {/each}
  </div>
</div>

{#if !!stockDetailsSymbol}
  <StockDetailsView {stockDetailsSymbol} on:close={() => (stockDetailsSymbol = "")} />
{/if}
