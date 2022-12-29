<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher, onMount } from "svelte";
  import { watchListStore } from "$lib/stores";

  const dispatch = createEventDispatcher();
  export let stockDetailsSymbol: string;

  onMount(async () => {
    const chartInfo = await watchListStore.getSymbolChartData(stockDetailsSymbol);
    console.log(chartInfo);
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="absolute top-0 left-0 h-full w-full bg-neutral-200/50 z-999"
  transition:fade={{ duration: 100 }}
  on:click|self={() => dispatch("close")}
>
  <div
    class="bg-white w-full p-(x-5 y-2) flex-u-between gap-5 text-neutral-900 mb-5 max-w-6xl mx-auto"
  >
    <!-- left box -->
    <div>
      <!--  -->
    </div>

    <!-- right box -->
    <div>
      <!--  -->
    </div>
  </div>
</div>
