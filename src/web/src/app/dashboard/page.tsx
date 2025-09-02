import type { Category, Shortcut } from "@/types";
import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

// Server component: fetch initial data and pass to a client component
export default async function Dashboard() {
  // fetch initial data on the server so the client receives hydrated props
  const [shortcutsRes, categoriesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/shortcuts`, {
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/categories`, {
      cache: "no-store",
    }),
  ]);

  const shortcuts: Shortcut[] = shortcutsRes.ok
    ? await shortcutsRes.json()
    : [];
  const categories: Category[] = categoriesRes.ok
    ? await categoriesRes.json()
    : [];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient
        shortcutsInitial={shortcuts}
        categoriesInitial={categories}
      />
    </Suspense>
  );
}
