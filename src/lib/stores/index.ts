/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Client } from "@apperate/iexjs";
import { readable, writable } from "svelte/store";
import { trpc } from "$trpc/client";
import { browser } from "$app/environment";

export type StockData = {
  symbol: string;
  description: string;
  bidPrice: string;
  askPrice: string;
  lastPrice: string;
};

type Watchlist = {
  id: string;
  name: string;
  symbols: string[];
  stockquotes: StockData[];
};

export const iexClient = new Client({
  api_token: "pk_064bf23dd6f649cfaf20cb7e4a222ecc",
  version: "v1",
});

export const watchListStore = useStockStore();
export const iexSymbols = readable<Map<string, any>>(new Map<string, any>(), set => {
  const sMap = new Map<string, any>();
  iexClient.iexSymbols().then((symbols: any[]) => {
    symbols.forEach(symbol => {
      sMap.set(symbol.symbol, symbol);
    });
    set(sMap);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return () => set(null);
});

function useStockStore() {
  const {
    subscribe,
    set: setStore,
    update: updateStore,
  } = writable<Map<string, Watchlist>>(new Map(), set => {
    // needs to run on client becacuse of a weird trpc issue
    if (browser) getStockData("", set);

    // const interval = setInterval(getStockData, 5000);
    // return () => clearInterval(interval);
  });

  async function getStockData(updateId: string, set = setStore) {
    if (updateId.trim()) {
      updateStore(v => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        v.set(updateId, { ...v.get(updateId)!, stockquotes: [] });
        return v;
      });
    }

    const temp = new Map<string, Watchlist>();
    const watchlists = await trpc().user.getWatchLists.query();

    // dedupe symbols
    const allSymbolsAcrossWatchLists = [
      ...new Set(watchlists.map(wl => wl.symbols.split(",")).flat()),
    ];
    const symbolsMap = new Map<string, any>();

    if (allSymbolsAcrossWatchLists.length === 0) return;

    const validSymbols = allSymbolsAcrossWatchLists.filter(v => v);

    for (let i = 0; i < validSymbols.length; i++) {
      const symbol = validSymbols[i];
      const quote = await iexClient.quote({ symbol });
      symbolsMap.set(symbol, quote);
    }

    watchlists.forEach(wl => {
      const wlSymbols = wl.symbols.split(",");
      const stockQuotes = wlSymbols.map(symbol => symbolsMap.get(symbol)).filter(v => v);

      temp.set(wl.id, {
        ...wl,
        symbols: wlSymbols,
        stockquotes: stockQuotes.map(stockQuote => ({
          symbol: stockQuote.symbol,
          description: stockQuote.companyName,
          bidPrice: stockQuote.iexBidPrice,
          askPrice: stockQuote.iexAskPrice,
          lastPrice: stockQuote.close,
        })),
      });
    });

    set(temp);
  }

  async function getSymbolChartData(symbol: string) {
    // range - 1m = 1 month = 30d
    return await iexClient.batch({ symbols: [symbol], fields: "chart", range: "1m" });
  }

  async function removeSymbolFromWatchlist(watchlistId: string, symbol: string) {
    let wlSymbols: string[] = [];
    subscribe(
      v => (wlSymbols = v.get(watchlistId)?.symbols.filter(s => s !== symbol) as string[])
    )();
    await trpc().user.updateWatchList.mutate({
      watchlistId,
      symbols: wlSymbols.join(","),
    });
    await getStockData(watchlistId);
  }

  async function addSymbolToWatchlist(watchlistId: string, symbol: string) {
    let wlSymbols: string[] = [];
    subscribe(v => (wlSymbols = v.get(watchlistId)?.symbols as string[]))();
    wlSymbols.push(symbol);
    await trpc().user.updateWatchList.mutate({
      watchlistId,
      symbols: wlSymbols.join(","),
    });
    await getStockData(watchlistId);
  }

  async function deleteWatchList(watchlistId: string) {
    await trpc().watchlist.delete.mutate({ watchlistId });
    await getStockData(watchlistId);
  }

  async function createWatchList(name: string) {
    await trpc().watchlist.create.mutate({ name });
    getStockData("");
  }

  async function updateWatchList(watchlistId: string, name: string) {
    await trpc().watchlist.updateName.mutate({ watchlistId, name });
    await getStockData(watchlistId);
  }

  return {
    subscribe,
    getSymbolChartData,
    removeSymbolFromWatchlist,
    addSymbolToWatchlist,
    createWatchList,
    deleteWatchList,
    updateWatchList,
  };
}
