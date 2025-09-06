import { redirect } from "next/navigation";

// Redirect to shortcuts as the default dashboard page
export default function Dashboard() {
  redirect("/dashboard/shortcuts");
}
