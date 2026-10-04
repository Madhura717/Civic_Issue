import type { CookieOptions, Request } from "express";

export function getSessionCookieOptions(_req: Request): CookieOptions {
  // Preview is public HTTPS in a cross-site frame even when the upstream request is HTTP.
  return { httpOnly: true, path: "/", sameSite: "none", secure: true };
}
