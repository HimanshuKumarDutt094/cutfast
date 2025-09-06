"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";

export function CategoriesTable() {
  const router = useRouter();
  const utils = api.useUtils();
  const [, setCategoryId] = useQueryState(
    "categoryId",
    parseAsString.withDefault(""),
  );

  const {
    data: categoriesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.categories.listInfinite.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const deleteMutation = api.categories.delete.useMutation({
    onSuccess: async () => {
      await utils.categories.invalidate();
      router.refresh();
    },
  });

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this category? This will also remove it from all associated shortcuts.",
      )
    ) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const categories = categoriesData?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Shortcuts Count</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  No categories found. Create your first category to get
                  started.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      {category.shortcutCount || 0} shortcuts
                    </TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void setCategoryId(category.id)}
                          disabled={isLoading || deleteMutation.isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          disabled={isLoading || deleteMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {hasNextPage && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        variant="outline"
                      >
                        {isFetchingNextPage ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
