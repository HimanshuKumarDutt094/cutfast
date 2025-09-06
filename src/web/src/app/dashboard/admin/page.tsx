import { env } from "@/env";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import AdminPageClient from "./AdminPageClient";

export default async function AdminPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // Check if user is admin
  if (!session?.user || session.user.email !== env.ADMIN_EMAIL) {
    notFound();
  }

  return <AdminPageClient />;
}
