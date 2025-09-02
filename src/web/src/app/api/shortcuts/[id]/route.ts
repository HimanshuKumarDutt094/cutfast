import { db } from "@/db";
import { shortcuts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const shortcut = await db
			.select()
			.from(shortcuts)
			.where(and(eq(shortcuts.id, id), eq(shortcuts.userId, session.user.id)))
			.limit(1);

		if (shortcut.length === 0) {
			return NextResponse.json(
				{ error: "Shortcut not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(shortcut[0]);
	} catch (error) {
		console.error("Error fetching shortcut:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const { shortcutKey, content, categoryId } = body;

		if (!shortcutKey || !content) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
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
			return NextResponse.json(
				{ error: "Shortcut not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(updatedShortcut[0]);
	} catch (error) {
		console.error("Error updating shortcut:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const deletedShortcut = await db
			.delete(shortcuts)
			.where(and(eq(shortcuts.id, id), eq(shortcuts.userId, session.user.id)))
			.returning();

		if (deletedShortcut.length === 0) {
			return NextResponse.json(
				{ error: "Shortcut not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ message: "Shortcut deleted" }, { status: 204 });
	} catch (error) {
		console.error("Error deleting shortcut:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
