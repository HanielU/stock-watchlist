import { db } from "$lib/server/prisma";
import { string, object } from "zod";
import { t } from "$trpc/router";

export default t.router({
  create: t.procedure
    .input(
      object({
        name: string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.locals.user) {
        throw new Error("User not found");
      }

      await db.watchlist.create({
        data: {
          name: input.name,
          symbols: "",
          userId: ctx.locals.user.id,
        },
      });
    }),

  updateName: t.procedure
    .input(
      object({
        watchlistId: string(),
        name: string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.locals.user) {
        throw new Error("User not found");
      }

      const v = await db.watchlist.update({
        where: {
          id: input.watchlistId,
        },
        data: {
          name: input.name,
        },
      });

      console.log({ v });
    }),

  delete: t.procedure
    .input(
      object({
        watchlistId: string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.locals.user) {
        throw new Error("User not found");
      }

      await db.watchlist.delete({
        where: {
          id: input.watchlistId,
        },
      });
    }),
});
