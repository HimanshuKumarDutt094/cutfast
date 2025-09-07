import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/server/better-auth";
import AdminPageClient from "./AdminPageClient";

export default async function AdminPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // Check if user is authenticated
  if (!session?.user) {
    notFound();
  }

  // Check if user has admin role
  if (session.user.role !== "admin") {
    notFound();
  }

  return <AdminPageClient />;
}
