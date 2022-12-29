import type { Action, Actions } from "./$types";
import { db } from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";

const logout: Action = async ({ cookies }) => {
  cookies.set("session", "", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  console.log("logout", cookies.get("session"));

  throw redirect(301, "/auth");
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
