"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { type ShortcutFormData, shortcutSchema } from "@/zod/shortcuts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export function ShortcutForm() {
  const router = useRouter();
  const utils = api.useUtils();
  // Drive dialog by query param (?shortcutId=new|<uuid>)
  const [shortcutId, setShortcutId] = useQueryState(
    "shortcutId",
    parseAsString.withDefault(""),
  );
  const isCreating = shortcutId === "new";
  const isEditing = shortcutId !== "" && shortcutId !== "new";

  // Fetch categories if not provided
  const { data: categoriesData } = api.categories.list.useQuery(undefined, {});
  const allCategories = categoriesData ?? [];

  // Fetch shortcut by id when editing via URL
  const { data: fetchedShortcut, isLoading } = api.shortcuts.getById.useQuery(
    { id: shortcutId },
    { enabled: isEditing },
  );

  const form = useForm<ShortcutFormData>({
    resolver: zodResolver(shortcutSchema),
    defaultValues: {
      shortcutKey: "",
      content: "",
      // When editing, if no category, set undefined to show placeholder
      categoryId: undefined,
    },
    mode: "onChange",
  });

  // Keep form in sync with fetched data when editing
  useEffect(() => {
    if (isEditing && fetchedShortcut) {
      form.reset({
        shortcutKey: fetchedShortcut.shortcutKey,
        content: fetchedShortcut.content,
        categoryId: (fetchedShortcut.categoryId as string | null) ?? undefined,
      });
    }
    if (isCreating) {
      form.reset({ shortcutKey: "", content: "", categoryId: undefined });
    }
  }, [isEditing, isCreating, fetchedShortcut, form]);

  // tRPC mutations
  const createMutation = api.shortcuts.create.useMutation({
    onSuccess: async () => {
      await utils.shortcuts.invalidate();
      form.reset();
      // Close dialog by clearing query param
      void setShortcutId("");
      router.refresh();
    },
  });
  const updateMutation = api.shortcuts.update.useMutation({
    onSuccess: async () => {
      await utils.shortcuts.invalidate();
      form.reset();
      void setShortcutId("");
      router.refresh();
    },
  });

  const onSubmit = (values: ShortcutFormData) => {
    if (isEditing && fetchedShortcut) {
      updateMutation.mutate({
        id: fetchedShortcut.id,
        shortcutKey: values.shortcutKey,
        content: values.content,
        categoryId: values.categoryId,
      });
    } else {
      createMutation.mutate({
        shortcutKey: values.shortcutKey,
        content: values.content,
        categoryId: values.categoryId,
      });
    }
  };
  // if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <Dialog
      open={shortcutId !== ""}
      onOpenChange={(next) => {
        if (!next) void setShortcutId("");
        else if (!shortcutId) void setShortcutId("new");
      }}
    >
      <Button onClick={() => void setShortcutId("new")}>
        <Plus className="mr-2 h-4 w-4" />
        Add Shortcut
      </Button>
      {isLoading ? (
        <div className="sm:max-w-[600px] absolute left-1/2  bg-white p-4">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <DialogContent className="sm:max-w-[600px] h-full max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Shortcut" : "Create New Shortcut"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your shortcut details below."
                : "Add a new shortcut to expand text quickly."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="shortcutKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shortcut Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="/msg-1"
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

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) =>
                          field.onChange(val === "none" ? undefined : val)
                        }
                        value={(field.value as string | undefined) ?? undefined}
                        disabled={
                          isLoading ||
                          createMutation.isPending ||
                          updateMutation.isPending
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Category</SelectItem>
                          {allCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the text that will replace the shortcut..."
                        className="min-h-[180px] max-h-[190px] overflow-scroll resize-none"
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
                      : "Update Shortcut"
                    : createMutation.isPending
                      ? "Creating..."
                      : "Create Shortcut"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      )}
    </Dialog>
  );
}
