import { Suspense } from "react";
import { ShortcutForm } from "@/components/shortcuts/ShortcutForm";
import { ShortcutsTable } from "@/components/shortcuts/ShortcutsTable";
import { api } from "@/trpc/server";

// Client component for shortcuts page
export default async function ShortcutsPage() {
  void api.categories.list.prefetch();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Shortcuts</h2>
            <p className="text-muted-foreground">
              Manage your text shortcuts for quick expansion.
            </p>
          </div>
          <Suspense>
            <ShortcutForm />
          </Suspense>
        </div>
        <Suspense>
          <ShortcutsTable />
        </Suspense>{" "}
      </div>
    </div>
  );
}
