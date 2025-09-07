import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { config, user } from "@/server/db/schema";

export const adminRouter = createTRPCRouter({
  // Get current config (public for reading signup status)
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(config)
      .where(eq(config.id, "global"))
      .limit(1);

    return result[0] || null;
  }),

  // Update max users
  updateMaxUsers: adminProcedure
    .input(z.object({ maxUsers: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(config)
        .set({
          maxUsers: input.maxUsers,
          updatedAt: new Date(),
        })
        .where(eq(config.id, "global"));

      return { success: true };
    }),

  // Toggle signup enabled/disabled
  toggleSignup: adminProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(config)
        .set({
          enableSignup: input.enabled,
          updatedAt: new Date(),
        })
        .where(eq(config.id, "global"));

      return { success: true };
    }),

  // Get all users
  getUsers: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(user.createdAt);

    return users;
  }),

  // Get user count
  getUserCount: adminProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.select({ count: user.id }).from(user);

    return result.length;
  }),
});
