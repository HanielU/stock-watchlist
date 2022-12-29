import { t } from "./router";
import user from "./routes/user";
import watchlist from "./routes/watchlist";

export const appRouter = t.router({ user, watchlist });

export type AppRouter = typeof appRouter;
