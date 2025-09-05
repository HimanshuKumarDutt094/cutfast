import { Suspense } from "react";
import { api, HydrateClient } from "@/trpc/server";
import DashboardClient from "./DashboardClient";

// Server component: fetch initial data and pass to a client component
export default async function Dashboard() {
  // Prefetch queries for hydration
  void api.shortcuts.list.prefetch();
  void api.categories.list.prefetch();

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardClient />
      </Suspense>
    </HydrateClient>
  );
}
