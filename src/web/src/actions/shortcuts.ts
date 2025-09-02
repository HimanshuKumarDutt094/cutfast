"use server";

import { db } from "@/db";
import { shortcuts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function createShortcut(formData: FormData) {
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session) {
		throw new Error("Unauthorized");
	}

	const shortcutKey = formData.get("shortcutKey") as string;
	const content = formData.get("content") as string;
	const categoryId = formData.get("categoryId") as string | null;

	if (!shortcutKey || !content) {
		throw new Error("Missing required fields");
	}

	const newShortcut = await db
		.insert(shortcuts)
		.values({
			userId: session.user.id,
			shortcutKey,
			content,
			categoryId: categoryId || null,
		})
		.returning();

	revalidatePath("/dashboard");
	return newShortcut[0];
}

export async function updateShortcut(id: string, formData: FormData) {
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session) {
		throw new Error("Unauthorized");
	}

	const shortcutKey = formData.get("shortcutKey") as string;
	const content = formData.get("content") as string;
	const categoryId = formData.get("categoryId") as string | null;

	if (!shortcutKey || !content) {
		throw new Error("Missing required fields");
	}

	const updatedShortcut = await db
		.update(shortcuts)
		.set({
			shortcutKey,
			content,
			categoryId: categoryId || null,
			lastModifiedAt: new Date(),
		})
		.where(and(eq(shortcuts.id, id), eq(shortcuts.userId, session.user.id)))
		.returning();

	if (updatedShortcut.length === 0) {
		throw new Error("Shortcut not found");
	}

	revalidatePath("/dashboard");
	return updatedShortcut[0];
}

export async function deleteShortcut(id: string) {
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session) {
		throw new Error("Unauthorized");
	}

	const deletedShortcut = await db
		.delete(shortcuts)
		.where(and(eq(shortcuts.id, id), eq(shortcuts.userId, session.user.id)))
		.returning();

	if (deletedShortcut.length === 0) {
		throw new Error("Shortcut not found");
	}

	revalidatePath("/dashboard");
	return { message: "Shortcut deleted" };
}
