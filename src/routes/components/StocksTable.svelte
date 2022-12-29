<script lang="ts">
  import type { StockData } from "$lib/stores";
  import { createEventDispatcher } from "svelte";

  export let watchlistData: StockData[];

  const dispatch = createEventDispatcher();

  const tableHeaders = [
    "Stock Symbol",
    "Description",
    "Bid Price",
    "Ask Price",
    "Last Price",
    "Manage",
  ];
</script>

<div class="overflow-x-auto relative shadow-(md neutral-100/80) sm:rounded-lg">
  <table class="w-full text-(sm left gray-500)">
    <thead class="text-(xs gray-700) uppercase bg-gray-50">
      <tr>
        {#each tableHeaders as title}
          <th scope="col" class="py-3 px-6"> {title} </th>
        {/each}
      </tr>
    </thead>

    <tbody>
      {#each watchlistData as { symbol, description, bidPrice, askPrice, lastPrice }}
        <tr
          class="bg-white border-b cursor-pointer transition hover:bg-neutral-100"
          on:click={() => dispatch("show-details", symbol)}
        >
          <th scope="row" class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
            {symbol}
          </th>
          <td class="py-4 px-6"> {description} </td>
          <td class="py-4 px-6"> {bidPrice} </td>
          <td class="py-4 px-6">
            {askPrice}
            <!-- <a href="/" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
              Edit
            </a> -->
          </td>
          <td class="py-4 px-6">{lastPrice}</td>
          <td class="py-4 px-6">
            <button
              class="bg-red-600 text-(white sm) rounded-lg p-(y1.5 x2)"
              on:click={() => dispatch("delete", symbol)}>Remove</button
            >
          </td>
        </tr>
      {:else}
        <tr class="bg-white border-b">
          <td colspan="5" class="py-4 px-6 text-center"> Loading data... </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
