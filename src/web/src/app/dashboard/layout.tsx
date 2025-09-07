import { Hash, Settings, Tags } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";
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
import { auth } from "@/server/better-auth";

const baseMenuItems = [
  {
    id: "shortcuts",
    label: "Shortcuts",
    icon: Hash,
    href: "/dashboard/shortcuts",
  },
  {
    id: "categories",
    label: "Categories",
    icon: Tags,
    href: "/dashboard/categories",
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const isAdmin = session?.user?.role === "admin";

  const menuItems = isAdmin
    ? [
        ...baseMenuItems,
        {
          id: "admin",
          label: "Admin",
          icon: Settings,
          href: "/dashboard/admin",
        },
      ]
    : baseMenuItems;
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
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
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
          <UserMenu />
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
