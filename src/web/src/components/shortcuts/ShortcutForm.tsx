"use client";

import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Category, Shortcut } from "@/types";

interface ShortcutFormProps {
  categories: Category[];
  shortcut?: Shortcut;
  action?: (formData: FormData) => Promise<any>;
  onSubmit?: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function ShortcutForm({
  categories,
  shortcut,
  action,
  onSubmit,
  isLoading = false,
}: ShortcutFormProps) {
  const isEditing = !!shortcut;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      const formData = new FormData(e.currentTarget);
      const data = {
        shortcutKey: formData.get("shortcutKey") as string,
        content: formData.get("content") as string,
        categoryId: formData.get("categoryId") as string === "none" ? null : formData.get("categoryId") as string,
      };
      await onSubmit(data);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {isEditing ? "Edit Shortcut" : "Add Shortcut"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
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
        <form action={action} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="shortcutKey" className="text-sm font-medium">
              Shortcut Key
            </label>
            <Input
              id="shortcutKey"
              name="shortcutKey"
              placeholder="/msg-1"
              defaultValue={shortcut?.shortcutKey || ""}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label htmlFor="categoryId" className="text-sm font-medium">
              Category (Optional)
            </label>
            <Select
              name="categoryId"
              defaultValue={shortcut?.categoryId || "none"}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              name="content"
              placeholder="Enter the text that will replace the shortcut..."
              className="min-h-[100px]"
              defaultValue={shortcut?.content || ""}
              disabled={isLoading}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Shortcut" : "Create Shortcut"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
