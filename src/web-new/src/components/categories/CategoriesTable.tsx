"use client";

import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { parseAsString, useQueryState } from "nuqs";
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
import type { Category } from "@/types";

interface CategoriesTableProps {
  categories: Category[];
  isLoading?: boolean;
}

export function CategoriesTable({
  categories,
  isLoading = false,
}: CategoriesTableProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const utils = api.useUtils();
  const [, setCategoryId] = useQueryState("categoryId", parseAsString.withDefault(""));

  const deleteMutation = api.categories.delete.useMutation({
    onSuccess: async () => {
      await utils.categories.invalidate();
      startTransition(() => router.refresh());
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
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {category._count?.shortcuts || 0} shortcuts
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
