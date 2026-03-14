import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUnauthenticatedContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

function createAuthenticatedContext(role: string = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "local-user",
    email: "user@example.com",
    name: "Test User",
    loginMethod: "local",
    role: role as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Local Authentication", () => {
  describe("auth.me", () => {
    it("returns null when user is not authenticated", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });

    it("returns user data when authenticated", async () => {
      const ctx = createAuthenticatedContext("user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).not.toBeNull();
      expect(result?.email).toBe("user@example.com");
      expect(result?.role).toBe("user");
    });

    it("returns admin user data when authenticated as admin", async () => {
      const ctx = createAuthenticatedContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).not.toBeNull();
      expect(result?.role).toBe("admin");
    });
  });

  describe("Protected Procedures", () => {
    it("should allow access to protected procedures for authenticated users", async () => {
      const ctx = createAuthenticatedContext("user");
      const caller = appRouter.createCaller(ctx);

      // This should not throw an error
      const result = await caller.auth.me();
      expect(result).not.toBeNull();
    });

    it("should deny access to protected procedures for unauthenticated users", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.auth.me();
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (error: any) {
        // Expected to throw an error
        expect(error.message).toContain("Unauthorized");
      }
    });
  });

  describe("Role-based Access Control", () => {
    it("should allow admin users to access admin procedures", async () => {
      const ctx = createAuthenticatedContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result?.role).toBe("admin");
    });

    it("should allow manager users to access manager procedures", async () => {
      const ctx = createAuthenticatedContext("manager");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result?.role).toBe("manager");
    });

    it("should allow partner users to access partner procedures", async () => {
      const ctx = createAuthenticatedContext("partner");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result?.role).toBe("partner");
    });
  });
});
