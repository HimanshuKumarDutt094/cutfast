"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function createCategory(formData: FormData) {
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session) {
		throw new Error("Unauthorized");
	}

	const name = formData.get("name") as string;

	if (!name) {
		throw new Error("Missing required fields");
	}

	const newCategory = await db
		.insert(categories)
		.values({
			userId: session.user.id,
			name,
		})
		.returning();

	revalidatePath("/dashboard");
	return newCategory[0];
}

export async function updateCategory(id: string, formData: FormData) {
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session) {
		throw new Error("Unauthorized");
	}

	const name = formData.get("name") as string;

	if (!name) {
		throw new Error("Missing required fields");
	}

	const updatedCategory = await db
		.update(categories)
		.set({ name })
		.where(eq(categories.id, id))
		.returning();

	if (updatedCategory.length === 0) {
		throw new Error("Category not found");
	}

	revalidatePath("/dashboard");
	return updatedCategory[0];
}

export async function deleteCategory(id: string) {
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session) {
		throw new Error("Unauthorized");
	}

	const deletedCategory = await db
		.delete(categories)
		.where(eq(categories.id, id))
		.returning();

	if (deletedCategory.length === 0) {
		throw new Error("Category not found");
	}

	revalidatePath("/dashboard");
	return { message: "Category deleted" };
}
