"use client";
import { Hash, Tags } from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
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
import { api } from "@/trpc/react";

type TabType = "shortcuts" | "categories";

export default function DashboardClient() {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringEnum(["shortcuts", "categories"]).withDefault("shortcuts")
  );
  // Keep using local state for dialog editing controls, but source data from tRPC queries

  // tRPC queries with initial data to hydrate cache and keep fresh on client
  const { data: shortcuts, isLoading: shortcutsLoading } =
    api.shortcuts.list.useQuery();
  const { data: categories, isLoading: categoriesLoading } =
    api.categories.list.useQuery();

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
                  categories={categories ?? []}
                  isLoading={shortcutsLoading}
                />
              </div>
              <ShortcutsTable />
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
                <CategoryForm isLoading={categoriesLoading} />
              </div>
              <CategoriesTable
                categories={categories ?? []}
                isLoading={categoriesLoading}
              />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
