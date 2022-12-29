<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import { watchListStore } from "$lib/stores";
  import {
    Chart,
    CategoryScale,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
  } from "chart.js";

  const dispatch = createEventDispatcher();
  export let stockDetailsSymbol: string;
  let quote: {
    symbol: any;
    description: any;
    bidPrice: any;
    askPrice: any;
    lastPrice: any;
  };
  let chartData: any;

  watchListStore
    .getSymbolChartData(stockDetailsSymbol)
    .then(data => ({ chart: chartData, quote } = data));

  function setupChart(ctx: HTMLCanvasElement) {
    const registerables = [LineController, LineElement, PointElement, CategoryScale, LinearScale];
    Chart.register(...registerables);
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData?.map((d: any) => d.date),
        datasets: [
          {
            label: "Price",
            data: chartData?.map((d: any) => d.close),
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return {
      destroy() {
        chart.destroy();
        Chart.unregister(registerables);
      },
    };
  }
</script>

<!-- 
  When a user selects a symbol from a watch list 
  it should bring up a new view that displays the 
  Stock Symbol, Bid, Ask, and Last Price As well as a chart
 -->

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="absolute top-0 left-0 h-full w-full bg-neutral-200/50 z-999 flex-u-center"
  transition:fade={{ duration: 100 }}
  on:click|self={() => dispatch("close")}
>
  <div
    class="bg-white w-full p-(x-5 y-2) @min-500:flex-u-between gap-5 text-neutral-900 mb-5 max-w-6xl mx-auto"
  >
    <!-- left box -->
    <div>
      <div>
        <h1 class="text-2xl font-semibold">{stockDetailsSymbol}</h1>
        <h2 class="text-sm font-semibold text-neutral-500">
          {quote?.description}
        </h2>
      </div>

      <div class="flex-u-start">
        <h3 class="text-base mr-5 font-semibold text-neutral-500">Bid:</h3>
        <h3 class="text-xl font-semibold">
          {quote?.bidPrice}
        </h3>
      </div>

      <div class="flex-u-start">
        <h3 class="text-sm font-semibold text-neutral-500">Ask:</h3>
        <h3 class="text-xl font-semibold">
          {quote?.askPrice}
        </h3>
      </div>

      <div class="flex-u-start">
        <h3 class="text-sm font-semibold text-neutral-500">Last Price:</h3>
        <h3 class="text-xl font-semibold">
          {quote?.lastPrice}
        </h3>
      </div>
    </div>

    <!-- right box -->
    <div>
      <div>
        <canvas use:setupChart class="w-full h-96" width="400" height="400" />
      </div>
      <!--  -->
    </div>
  </div>
</div>
