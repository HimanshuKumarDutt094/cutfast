"use client";

import { createShortcut } from "@/actions/shortcuts";
import { UserMenu } from "@/components/auth/UserMenu";
import { CategoriesTable } from "@/components/categories/CategoriesTable";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { ShortcutForm } from "@/components/shortcuts/ShortcutForm";
import { ShortcutsTable } from "@/components/shortcuts/ShortcutsTable";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import type { Category, Shortcut } from "@/types";
import type { CategoryFormData, ShortcutFormData } from "@/zod/shortcuts";
import { Hash, Tags } from "lucide-react";
import { useEffect, useState } from "react";

type TabType = "shortcuts" | "categories";

export default function DashboardClient({
	shortcutsInitial = [],
	categoriesInitial = [],
}: {
	shortcutsInitial?: Shortcut[];
	categoriesInitial?: Category[];
}) {
	const [activeTab, setActiveTab] = useState<TabType>("shortcuts");
	const [shortcuts, setShortcuts] = useState<Shortcut[]>(shortcutsInitial);
	const [categories, setCategories] = useState<Category[]>(categoriesInitial);
	const [isLoading, setIsLoading] = useState(false);

	// Keep data fresh when component mounts; server gave initial data but client may
	// need to revalidate.
	// intentionally run once on mount to revalidate server-provided data
	useEffect(() => {
		// inline fetches so the hook has no external function dependencies
		(async () => {
			try {
				const res = await fetch("/api/shortcuts");
				if (res.ok) setShortcuts(await res.json());
			} catch (e) {
				console.error("Error fetching shortcuts:", e);
			}

			try {
				const res2 = await fetch("/api/categories");
				if (res2.ok) setCategories(await res2.json());
			} catch (e) {
				console.error("Error fetching categories:", e);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchShortcuts = async () => {
		try {
			const response = await fetch("/api/shortcuts");
			if (response.ok) {
				const data = await response.json();
				setShortcuts(data);
			}
		} catch (error) {
			console.error("Error fetching shortcuts:", error);
		}
	};

	const fetchCategories = async () => {
		try {
			const response = await fetch("/api/categories");
			if (response.ok) {
				const data = await response.json();
				setCategories(data);
			}
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	};

	const handleCreateShortcut = async (data: ShortcutFormData) => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/shortcuts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (response.ok) {
				await fetchShortcuts();
			} else {
				throw new Error("Failed to create shortcut");
			}
		} catch (error) {
			console.error("Error creating shortcut:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateShortcut = async (shortcut: Shortcut) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/shortcuts/${shortcut.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					shortcutKey: shortcut.shortcutKey,
					content: shortcut.content,
					categoryId: shortcut.categoryId,
				}),
			});

			if (response.ok) {
				await fetchShortcuts();
			} else {
				throw new Error("Failed to update shortcut");
			}
		} catch (error) {
			console.error("Error updating shortcut:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteShortcut = async (id: string) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/shortcuts/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				await fetchShortcuts();
			} else {
				throw new Error("Failed to delete shortcut");
			}
		} catch (error) {
			console.error("Error deleting shortcut:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateCategory = async (data: CategoryFormData) => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/categories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (response.ok) {
				await fetchCategories();
				await fetchShortcuts(); // Refresh shortcuts to get updated category info
			} else {
				throw new Error("Failed to create category");
			}
		} catch (error) {
			console.error("Error creating category:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateCategory = async (category: Category) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/categories/${category.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: category.name }),
			});

			if (response.ok) {
				await fetchCategories();
				await fetchShortcuts(); // Refresh shortcuts to get updated category info
			} else {
				throw new Error("Failed to update category");
			}
		} catch (error) {
			console.error("Error updating category:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteCategory = async (id: string) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/categories/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				await fetchCategories();
				await fetchShortcuts(); // Refresh shortcuts to get updated category info
			} else {
				throw new Error("Failed to delete category");
			}
		} catch (error) {
			console.error("Error deleting category:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const menuItems = [
		{
			id: "shortcuts" as TabType,
			label: "Shortcuts",
			icon: Hash,
		},
		{
			id: "categories" as TabType,
			label: "Categories",
			icon: Tags,
		},
	];

	return (
		<SidebarProvider>
			<Sidebar>
				<SidebarHeader className="border-b px-6 py-4">
					<h2 className="text-lg font-semibold">CutFast Dashboard</h2>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Management</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{menuItems.map((item) => (
									<SidebarMenuItem key={item.id}>
										<SidebarMenuButton
											isActive={activeTab === item.id}
											onClick={() => setActiveTab(item.id)}
										>
											<item.icon className="h-4 w-4" />
											<span>{item.label}</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<div className="flex items-center gap-2 flex-1">
						<h1 className="text-xl font-semibold">
							{menuItems.find((item) => item.id === activeTab)?.label}
						</h1>
					</div>
					<UserMenu />
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4">
					{activeTab === "shortcuts" && (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-2xl font-bold tracking-tight">
										Shortcuts
									</h2>
									<p className="text-muted-foreground">
										Manage your text shortcuts for quick expansion.
									</p>
								</div>
								<ShortcutForm
									categories={categories}
									action={createShortcut}
									isLoading={isLoading}
								/>
							</div>
							<ShortcutsTable
								shortcuts={shortcuts}
								categories={categories}
								onEdit={handleUpdateShortcut}
								onDelete={handleDeleteShortcut}
								isLoading={isLoading}
							/>
						</div>
					)}

					{activeTab === "categories" && (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-2xl font-bold tracking-tight">
										Categories
									</h2>
									<p className="text-muted-foreground">
										Organize your shortcuts with categories.
									</p>
								</div>
								<CategoryForm
									onSubmit={handleCreateCategory}
									isLoading={isLoading}
								/>
							</div>
							<CategoriesTable
								categories={categories}
								onEdit={handleUpdateCategory}
								onDelete={handleDeleteCategory}
								isLoading={isLoading}
							/>
						</div>
					)}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
