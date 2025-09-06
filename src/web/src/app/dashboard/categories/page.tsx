import { Suspense } from "react";
import { CategoriesTable } from "@/components/categories/CategoriesTable";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { api } from "@/trpc/server";

// Client component for categories page
export default async function CategoriesPage() {
  // tRPC queries
  void api.categories.list.prefetch();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
            <p className="text-muted-foreground">
              Organize your shortcuts with categories.
            </p>
          </div>
          <Suspense>
            <CategoryForm />
          </Suspense>{" "}
        </div>
        <Suspense>
          <CategoriesTable />
        </Suspense>
      </div>
    </div>
  );
}
