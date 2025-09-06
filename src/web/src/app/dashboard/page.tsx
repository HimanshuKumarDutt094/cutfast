import { api, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

// Prevent prerendering since this page requires authentication
export const dynamic = 'force-dynamic';

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
