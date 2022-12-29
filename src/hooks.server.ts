import type { Handle } from "@sveltejs/kit";
import { appRouter as trpcRouter } from "$trpc";
import { createContext } from "$trpc/router";
import { createTRPCHandle } from "trpc-sveltekit";
import { db } from "$lib/server/prisma";

const trpcHandle: Handle = async ({ event, resolve }) => {
  // check if user cookie is set
  const session = event.cookies.get("session");

  // if not, redirect to login page
  if (!session && event.url.pathname !== "/auth") {
    return Response.redirect(event.url.origin + "/auth");
  } else if (session) {
    const user = await db.user.findUnique({ where: { username: session } });

    // logout and redirect to login page
    if (!user) {
      event.cookies.set("session", "", {
        path: event.url.origin,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
      });

      if (event.url.pathname !== "/auth") {
        return Response.redirect(event.url.origin + "/auth");
      }
    } else {
      event.locals.user = user;
      if (event.url.pathname === "/auth") {
        return Response.redirect(event.url.origin);
      }
    }
  }

  // 👇 add this handle
  const response = await createTRPCHandle({
    url: "/trpc",
    router: trpcRouter,
    createContext,
    event,
    resolve,
  });

  return response;
};

export const handle = trpcHandle;
