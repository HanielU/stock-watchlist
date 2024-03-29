<script lang="ts">
  import { progression } from "$lib/dummydata";
  import { hslToHsla } from "$lib/utils";
  import { themeColorsMain } from "$lib/utils/theme";
  import {
    BarController,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    LinearScale,
    Tooltip,
    type ChartConfiguration,
    type ChartData,
    type ChartTypeRegistry,
    type DefaultDataPoint,
  } from "chart.js";
  // import { fontString } from "chart.js/helpers";

  const cgpa = 3.56;

  // const barThickness = ; // 50px was the og size
  const getChartData = (
    barThickness: number
  ): ChartData<"bar", DefaultDataPoint<"bar">, string> => ({
    labels: Object.keys(progression), // x-axis label
    datasets: [
      {
        label: "GPA",
        data: Object.values(progression), // y-axis values
        backgroundColor: themeColorsMain.neutral[200],
        borderWidth: 0,
        borderRadius: 5,
        borderSkipped: false,
        // hoverBackgroundColor: themeVars.color.primary,
        hoverBackgroundColor: ctx => {
          if (ctx.parsed.y < 2) return themeColorsMain.redV[400];
          else if (ctx.parsed.y < 3) return themeColorsMain.orangeV[400];
          else if (ctx.parsed.y <= 4) return themeColorsMain.teal[400];
        },
        barThickness,
      },
    ],
  });

  const config = (
    calculateChartWidth: () => void,
    data: ReturnType<typeof getChartData>
  ): ChartConfiguration<keyof ChartTypeRegistry> => ({
    type: "bar",
    data,
    options: {
      onResize: calculateChartWidth,
      maintainAspectRatio: false, // alows chart to use the width and height of parent wrapper
      plugins: {
        tooltip: {
          displayColors: false,
          backgroundColor: hslToHsla(themeColorsMain.primary["DEFAULT"], 0.85),
          // titleColor: themeVars.color.primary,
          // bodyColor: themeVars.color.primary,
          padding: {
            top: 10,
            right: 15,
            bottom: 10,
            left: 10,
          },
        },
      },
      animation: {
        onProgress: animation => {
          const chartInstance = animation.chart;
          const ctx = chartInstance.ctx;

          /* ctx.font = fontString(
            ChartJS.defaults.font.size!,
            ChartJS.defaults.font.style!,
            ChartJS.defaults.font.family!
          ); */

          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";

          chartInstance.data.datasets.forEach((dataset, i) => {
            const meta = chartInstance.getDatasetMeta(i);
            meta.data.forEach((bar, index) => {
              const data = dataset.data[index] as unknown as string;
              ctx.fillText(data, bar.x, bar.y - 5);
            });
          });
        },
      },
      scales: {
        y: {
          display: false,
          max: 4.25,
        },
        x: {
          border: {
            display: false,
          },
        },
      },
    },
  });

  function setupChart(ctx: HTMLCanvasElement, { barThickness }: { barThickness: number }) {
    const registerables = [BarController, Tooltip, LinearScale, CategoryScale, BarElement];
    ChartJS.register(registerables);
    const data = getChartData(barThickness);
    const lengthOfProgression = data.labels?.length as number;
    const sideMarginProbably = 20;
    const chartWidth =
      barThickness * lengthOfProgression + sideMarginProbably * lengthOfProgression;

    function calculateChartWidth() {
      const parentDiv = ctx.parentElement as HTMLDivElement;

      if (chartWidth > parentDiv.clientWidth) {
        const chartToParentDifference = chartWidth - parentDiv.clientWidth;
        // increases the scrollable width of the chart
        parentDiv.style.width = `${
          parentDiv.clientWidth +
          // found a great ratio, wouldn't touch if I were you
          (chartToParentDifference < 150 ? 20 : barThickness) * lengthOfProgression
        }px`;
      }
    }

    const chart = new ChartJS(ctx, config(calculateChartWidth, data));

    return {
      destroy() {
        chart.destroy();
        ChartJS.unregister(registerables);
      },
    };
  }
</script>

<div class="rounded-4 bg-base-100 w-full shadow overflow-hidden">
  <!-- CGPA -->
  <div class="w-full text-center mb-5 relative p-(t-5 x-5 b-2)">
    <h3 class="font-medium uppercase text-(neutral-600 xs) mb-1">Cumulative Grade Point Average</h3>

    <h1 class="font-(semibold secondary) text-(4xl neutral-800) uppercase">
      {cgpa}
    </h1>

    <!-- divider -->
    <div class="w-full absolute bottom-0 left-0 s-flex-center">
      <div class="w-80% min-w-200px" border-b="~ neutral-100" />
    </div>
  </div>

  <!-- Chart "legend" -->
  <h4 class="uppercase text-(xs center)">
    Performance Graph .
    <h1 class="font-semibold text-neutral-600 inline-block">Max Performance: 4</h1>
  </h4>

  <!-- Chart -->
  <div
    class="h-350px w-full overflow-x-scroll md:w-600px
    scrollbar:h-1
    scrollbar-track:(rounded-2.5 bg-neutral-50)
    scrollbar-thumb:(rounded-2.5 bg-neutral-200/80)"
    p="t-5 b-6 x-5"
  >
    <div class="illegal-scroll relative h-full w-100%">
      <canvas use:setupChart={{ barThickness: window.innerWidth - 1 > 450 ? 45 : 36 }} />
    </div>
  </div>
</div>
