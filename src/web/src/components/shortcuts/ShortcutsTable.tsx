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
import { useTransition } from "react";

export function ShortcutsTable() {
  const { data: categories } = api.categories.list.useQuery();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const utils = api.useUtils();
  const [, setShortcutId] = useQueryState(
    "shortcutId",
    parseAsString.withDefault(""),
  );

  const {
    data: shortcutsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.shortcuts.listInfinite.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const deleteMutation = api.shortcuts.delete.useMutation({
    onSuccess: async () => {
      await utils.shortcuts.invalidate();
      startTransition(() => router.refresh());
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this shortcut?")) {
      deleteMutation.mutate({ id });
    }
  };

  const shortcuts = shortcutsData?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) return <Loader2 className="animate-spin" />;
  if (!categories) return <div>Error loading categories</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shortcut Key</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shortcuts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-muted-foreground"
              >
                No shortcuts found. Create your first shortcut to get started.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {shortcuts.map((shortcut) => (
                <TableRow key={shortcut.id}>
                  <TableCell className="font-medium font-mono">
                    {shortcut.shortcutKey}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {shortcut.content}
                  </TableCell>
                  <TableCell>
                    {categories?.find((c) => c.id === shortcut.categoryId)
                      ?.name ?? "No Category"}
                  </TableCell>
                  <TableCell>
                    {new Date(shortcut.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void setShortcutId(shortcut.id)}
                        disabled={isLoading || deleteMutation.isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(shortcut.id)}
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
                  <TableCell colSpan={5} className="text-center py-4">
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
  );
}
