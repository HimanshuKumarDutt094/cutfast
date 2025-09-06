import type { TRPCRouterRecord } from "@trpc/server";
import { and, count, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { categories, shortcuts } from "@/server/db/schema";
import { categorySchema } from "@/zod/shortcuts";
import { protectedProcedure } from "../trpc";

export const categoriesRouter = {
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: categories.id,
        userId: categories.userId,
        name: categories.name,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        shortcutCount: count(shortcuts.id),
      })
      .from(categories)
      .leftJoin(
        shortcuts,
        and(
          eq(shortcuts.categoryId, categories.id),
          eq(shortcuts.userId, ctx.session.user.id),
        ),
      )
      .where(eq(categories.userId, ctx.session.user.id))
      .groupBy(categories.id);
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
        .select({
          id: categories.id,
          userId: categories.userId,
          name: categories.name,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
          shortcutCount: count(shortcuts.id),
        })
        .from(categories)
        .leftJoin(
          shortcuts,
          and(
            eq(shortcuts.categoryId, categories.id),
            eq(shortcuts.userId, ctx.session.user.id),
          ),
        )
        .where(
          and(
            eq(categories.userId, ctx.session.user.id),
            cursor ? gt(categories.createdAt, new Date(cursor)) : undefined,
          ),
        )
        .groupBy(categories.id)
        .orderBy(categories.createdAt)
        .limit(limit + 1);

      let nextCursor: string | undefined;
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
        .from(categories)
        .where(
          and(
            eq(categories.id, input.id),
            eq(categories.userId, ctx.session.user.id),
          ),
        );
      return rows[0] ?? null;
    }),

  create: protectedProcedure
    .input(categorySchema)
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db
        .insert(categories)
        .values({ userId: ctx.session.user.id, name: input.name })
        .returning();
      return created[0];
    }),

  update: protectedProcedure
    .input(z.object({ id: z.uuid() }).merge(categorySchema))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db
        .update(categories)
        .set({ name: input.name })
        .where(
          and(
            eq(categories.id, input.id),
            eq(categories.userId, ctx.session.user.id),
          ),
        )
        .returning();
      if (updated.length === 0) throw new Error("Category not found");
      return updated[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db
        .delete(categories)
        .where(
          and(
            eq(categories.id, input.id),
            eq(categories.userId, ctx.session.user.id),
          ),
        )
        .returning();
      if (deleted.length === 0) throw new Error("Category not found");
      return { success: true };
    }),
} satisfies TRPCRouterRecord;
