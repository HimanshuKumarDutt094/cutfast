"use client";

import { updateShortcut } from "@/actions/shortcuts";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Category, Shortcut } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { ShortcutForm } from "./ShortcutForm";

interface ShortcutsTableProps {
	shortcuts: Shortcut[];
	categories: Category[];
	onEdit: (shortcut: Shortcut) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	isLoading?: boolean;
}

export function ShortcutsTable({
	shortcuts,
	categories,
	onEdit,
	onDelete,
	isLoading = false,
}: ShortcutsTableProps) {
	const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);

	const handleEdit = async (data: any) => {
		if (editingShortcut) {
			await onEdit({ ...editingShortcut, ...data });
			setEditingShortcut(null);
		}
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this shortcut?")) {
			await onDelete(id);
		}
	};

	return (
		<>
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
									className="text-center py-8 text-muted-foreground"
								>
									No shortcuts found. Create your first shortcut to get started.
								</TableCell>
							</TableRow>
						) : (
							shortcuts.map((shortcut) => (
								<TableRow key={shortcut.id}>
									<TableCell className="font-mono font-medium">
										{shortcut.shortcutKey}
									</TableCell>
									<TableCell className="max-w-[300px] truncate">
										{shortcut.content}
									</TableCell>
									<TableCell>
										{shortcut.category?.name || "No Category"}
									</TableCell>
									<TableCell>
										{new Date(shortcut.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setEditingShortcut(shortcut)}
												disabled={isLoading}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(shortcut.id)}
												disabled={isLoading}
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

			{editingShortcut && (
				<ShortcutForm
					categories={categories}
					shortcut={editingShortcut}
					action={updateShortcut.bind(null, editingShortcut.id)}
					isLoading={isLoading}
				/>
			)}
		</>
	);
}
