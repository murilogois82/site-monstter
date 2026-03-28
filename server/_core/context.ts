import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Primeiro, tenta autenticação local via cookie
  try {
    const cookieValue = opts.req.cookies[COOKIE_NAME];
    if (cookieValue) {
      user = JSON.parse(cookieValue) as User;
      console.debug("[Auth] Local auth successful:", user.username);
      return {
        req: opts.req,
        res: opts.res,
        user,
      };
    }
  } catch (error) {
    console.debug("[Auth] Local auth failed:", error instanceof Error ? error.message : "Unknown error");
  }

  // Se não houver autenticação local, tenta OAuth (para compatibilidade)
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    // Log the error for debugging but don't throw
    if (error instanceof Error) {
      console.debug("[Auth] Non-critical auth error:", error.message);
    }
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
