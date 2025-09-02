import { db } from "@/db";
import { shortcuts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userShortcuts = await db
			.select()
			.from(shortcuts)
			.where(eq(shortcuts.userId, session.user.id));

		return NextResponse.json(userShortcuts);
	} catch (error) {
		console.error("Error fetching shortcuts:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { shortcutKey, content, categoryId } = body;

		if (!shortcutKey || !content) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
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

		return NextResponse.json(newShortcut[0], { status: 201 });
	} catch (error) {
		console.error("Error creating shortcut:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
