import type { Action, Actions } from "./$types";
import { db } from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(301, "/");
  }
};

const logout: Action = async event => {
  event.cookies.delete("session");
  event.locals.user = null;
};

const login: Action = async ({ request, cookies }) => {
  const data = await request.formData();
  const username = data.get("username") as string;

  let user = await db.user.findUnique({ where: { username } });

  if (!user) {
    user = await db.user.create({
      data: {
        username,
        watchlists: {
          create: [
            {
              name: username + "'s first list",
              symbols: ["AAPL", "MSFT", "SPY"].join(","),
            },
          ],
        },
      },
    });
  }

  cookies.set("session", user.username, {
    // send cookie for every page
    path: "/",
    // server side only cookie so you can't use `document.cookie`
    httpOnly: true,
    // only requests from same site can send cookies
    // https://developer.mozilla.org/en-US/docs/Glossary/CSRF
    sameSite: "strict",
    // only sent over HTTPS in production
    secure: process.env.NODE_ENV === "production",
    // set cookie to expire after a week
    maxAge: 60 * 60 * 24 * 7,
  });

  throw redirect(301, "/");
};

export const actions: Actions = {
  login,
  logout,
};
