import { env } from "@/env";
import { eq } from "drizzle-orm";
import { db } from ".";
import { auth } from "../better-auth";
import { config, user } from "./schema";

/**
 * Seeds the database with an admin user if one doesn't already exist
 * and admin credentials are provided in environment variables
 */
/**
 * Seeds the config table with default values
 */
export async function seedConfig() {
  try {
    console.log("Seeding config...");

    // Check if config already exists
    const existingConfig = await db
      .select()
      .from(config)
      .where(eq(config.id, "global"))
      .limit(1);

    if (existingConfig.length > 0) {
      console.log("Config already exists, skipping seeding");
      return;
    }

    // Insert new config
    await db.insert(config).values({
      id: "global",
      maxUsers: String(env.MAX_USERS || "100"),
      enableSignup: true,
    });

    console.log("Config seeded successfully");
  } catch (error: any) {
    // If table doesn't exist, we'll skip for now
    // In production, you'd want to create the table first
    if (error.message?.includes('relation "config" does not exist')) {
      console.log("Config table doesn't exist, skipping config seeding");
    } else {
      console.error("Error seeding config:", error);
    }
  }
}

export async function seedAdminUser() {
  try {
    // Check if admin credentials are provided
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
      console.log("Admin credentials not provided, skipping admin seeding");
      return;
    }

    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(user)
      .where(eq(user.email, env.ADMIN_EMAIL))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("Admin user already exists, skipping seeding");
      return;
    }

    console.log("Seeding admin user...");

    // Use the auth API to create the admin user
    const result = await auth.api.signUpEmail({
      body: {
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        name: "Admin User",
      },
    });

    if (result.user) {
      console.log("Admin user seeded successfully:", result.user.email);

    } else {
      console.error("Failed to seed admin user:", result);
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

/**
 * Main seed function that can be called during build
 */
export async function seed() {
  console.log("Starting database seeding...");

  await seedConfig();
  await seedAdminUser();

  console.log("Database seeding completed");
}

// Run seeding when this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log("Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
