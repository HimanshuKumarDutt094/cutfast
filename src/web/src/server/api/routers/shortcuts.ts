import { shortcuts } from "@/server/db/schema";
import { shortcutSchema } from "@/zod/shortcuts";
import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const shortcutsRouter = {
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(shortcuts)
      .where(eq(shortcuts.userId, ctx.session.user.id));
    return rows;
  }),

  listInfinite: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const rows = await ctx.db
        .select()
        .from(shortcuts)
        .where(
          and(
            eq(shortcuts.userId, ctx.session.user.id),
            cursor ? gt(shortcuts.createdAt, new Date(cursor)) : undefined,
          ),
        )
        .orderBy(shortcuts.createdAt)
        .limit(limit + 1);

      let nextCursor: string | undefined = undefined;
      if (rows.length > limit) {
        const nextItem = rows.pop();
        nextCursor = nextItem!.createdAt.toISOString();
      }

      return {
        items: rows,
        nextCursor,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(shortcuts)
        .where(
          and(
            eq(shortcuts.id, input.id),
            eq(shortcuts.userId, ctx.session.user.id),
          ),
        );
      return rows[0] ?? null;
    }),

  // Lookup by shortcut key for extension queries
  getByKey: protectedProcedure
    .input(
      z.object({
        key: z
          .string()
          .min(1)
          .regex(/^\/[a-zA-Z0-9_-]+$/),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(shortcuts)
        .where(
          and(
            eq(shortcuts.shortcutKey, input.key),
            eq(shortcuts.userId, ctx.session.user.id),
          ),
        );
      return rows[0] ?? null;
    }),

  // Delta sync: fetch records changed since the provided timestamp
  updatedSince: protectedProcedure
    .input(
      z.object({
        since: z.coerce.date(), // accepts ISO string or Date
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(shortcuts)
        .where(
          and(
            eq(shortcuts.userId, ctx.session.user.id),
            gt(shortcuts.lastModifiedAt, input.since),
          ),
        );
      return rows;
    }),

  create: protectedProcedure
    .input(shortcutSchema)
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db
        .insert(shortcuts)
        .values({
          userId: ctx.session.user.id,
          shortcutKey: input.shortcutKey,
          content: input.content,
          categoryId: input.categoryId ?? null,
        })
        .returning();
      return created[0];
    }),

  update: protectedProcedure
    .input(z.object({ id: z.uuid() }).merge(shortcutSchema))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db
        .update(shortcuts)
        .set({
          shortcutKey: input.shortcutKey,
          content: input.content,
          categoryId: input.categoryId ?? null,
          lastModifiedAt: new Date(),
        })
        .where(
          and(
            eq(shortcuts.id, input.id),
            eq(shortcuts.userId, ctx.session.user.id),
          ),
        )
        .returning();
      if (updated.length === 0) throw new Error("Shortcut not found");
      return updated[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db
        .delete(shortcuts)
        .where(
          and(
            eq(shortcuts.id, input.id),
            eq(shortcuts.userId, ctx.session.user.id),
          ),
        )
        .returning();
      if (deleted.length === 0) throw new Error("Shortcut not found");
      return { success: true };
    }),
} satisfies TRPCRouterRecord;
