import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  // Check if user is authenticated
  const session = await authClient.getSession();

  if (!session.data) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {session.data.user.name || session.data.user.email}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Shortcuts</h3>
            <p className="text-muted-foreground">
              Manage your text shortcuts and categories
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-muted-foreground">
              View usage statistics and insights
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-muted-foreground">Configure your preferences</p>
          </div>
        </div>
      </div>
    </div>
  );
}
