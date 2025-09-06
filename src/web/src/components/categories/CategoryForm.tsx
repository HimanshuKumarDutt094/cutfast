"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import type { Category } from "@/types";
import { type CategoryFormData, categorySchema } from "@/zod/shortcuts";

interface CategoryFormProps {
  isLoading?: boolean;
}

export function CategoryForm({ isLoading = false }: CategoryFormProps) {
  const router = useRouter();
  const utils = api.useUtils();
  // Drive dialog by query param (?categoryId=new|<uuid>)
  const [categoryId, setCategoryId] = useQueryState(
    "categoryId",
    parseAsString.withDefault(""),
  );
  const isCreating = categoryId === "new";
  const isEditing = categoryId !== "" && categoryId !== "new";

  // Fetch category by id when editing via URL
  const { data: fetchedCategory } = api.categories.getById.useQuery(
    { id: categoryId },
    { enabled: isEditing },
  );

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
    mode: "onChange",
  });

  // Keep form in sync with fetched data
  useEffect(() => {
    if (isEditing && fetchedCategory) {
      form.reset({ name: fetchedCategory.name });
    }
    if (isCreating) form.reset({ name: "" });
  }, [isEditing, isCreating, fetchedCategory, form]);

  // Mutations
  const createMutation = api.categories.create.useMutation({
    onSuccess: async () => {
      await utils.categories.invalidate();
      void setCategoryId("");
      form.reset();
      router.refresh();
    },
  });

  const updateMutation = api.categories.update.useMutation({
    onSuccess: async () => {
      await utils.categories.invalidate();
      void setCategoryId("");
      form.reset();
      router.refresh();
    },
  });

  const onSubmit = (values: CategoryFormData) => {
    if (isEditing && fetchedCategory) {
      updateMutation.mutate({ id: fetchedCategory.id, name: values.name });
    } else {
      createMutation.mutate({ name: values.name });
    }
  };

  return (
    <Dialog
      open={categoryId !== ""}
      onOpenChange={(next) => {
        if (!next) void setCategoryId("");
        else if (!categoryId) void setCategoryId("new");
      }}
    >
      <Button onClick={() => void setCategoryId("new")}>
        <Plus className="mr-2 h-4 w-4" />
        Add Category
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "Create New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your category details below."
              : "Add a new category to organize your shortcuts."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Work, Personal, Code"
                      disabled={
                        isLoading ||
                        createMutation.isPending ||
                        updateMutation.isPending
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !form.formState.isValid ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {(isLoading ||
                  createMutation.isPending ||
                  updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing
                  ? updateMutation.isPending
                    ? "Updating..."
                    : "Update Category"
                  : createMutation.isPending
                    ? "Creating..."
                    : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
