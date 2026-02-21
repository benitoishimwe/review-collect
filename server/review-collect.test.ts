import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "owner@testbusiness.com",
    name: "Test Owner",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

// ─── Auth tests ───────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "sample-user",
        email: "sample@example.com",
        name: "Sample User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});

// ─── Auth.me tests ────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns the user for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("owner@testbusiness.com");
    expect(result?.name).toBe("Test Owner");
  });
});

// ─── Business router tests ────────────────────────────────────────────────────

describe("business.get", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.business.get()).rejects.toThrow();
  });
});

describe("business.getPublic", () => {
  it("throws NOT_FOUND for unknown slugs", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.business.getPublic({ slug: "nonexistent-slug-xyz-999" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

// ─── Campaign router tests ────────────────────────────────────────────────────

describe("campaign.list", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.campaign.list()).rejects.toThrow();
  });
});

describe("campaign.create", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.campaign.create({ title: "Test Campaign", isActive: "yes" })
    ).rejects.toThrow();
  });

  it("throws BAD_REQUEST when no business profile exists", async () => {
    const ctx = createAuthContext({ id: 99999 }); // non-existent user
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.campaign.create({ title: "Test Campaign", isActive: "yes" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── Review router tests ──────────────────────────────────────────────────────

describe("review.submit", () => {
  it("throws NOT_FOUND for unknown business slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.review.submit({
        slug: "nonexistent-biz-xyz-999",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        rating: 5,
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("review.list", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.review.list({ limit: 10, offset: 0 })
    ).rejects.toThrow();
  });
});

describe("review.markWinner", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.review.markWinner({ reviewId: 1 })
    ).rejects.toThrow();
  });
});
