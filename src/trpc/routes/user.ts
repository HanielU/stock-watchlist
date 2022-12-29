import { db } from "$lib/server/prisma";
import { string, object } from "zod";
import { t } from "$trpc/router";

export default t.router({
  getWatchLists: t.procedure.query(async ({ ctx }) => {
    if (!ctx.locals.user) {
      throw new Error("User not found");
    }

    const user = await db.user.findUnique({
      where: {
        username: ctx.locals.user.username,
      },
      include: {
        watchlists: true,
      },
    });

    return user?.watchlists;
  }),

  updateWatchList: t.procedure
    .input(
      object({
        watchlistId: string(),
        symbols: string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.locals.user) {
        throw new Error("User not found");
      }

      try {
        await db.user.update({
          where: {
            username: ctx.locals.user.username,
          },
          data: {
            watchlists: {
              update: {
                where: {
                  id: input.watchlistId,
                },
                data: {
                  symbols: input.symbols,
                },
              },
            },
          },
        });
      } catch (error) {
        console.log(error);
      }
    }),
});
