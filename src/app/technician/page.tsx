import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS, logActivity } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import RoleHome from "@/components/RoleHome";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "home", label: "Dashboard", href: "/technician", icon: "🏠" },
  { key: "equipment", label: "Equipment", href: "/technician/equipment", icon: "🚜" },
  { key: "orders", label: "Work orders", href: "/technician/orders", icon: "📋" },
  { key: "photos", label: "Inspections", href: "/technician/photos", icon: "📷" },
];

const CAPS = [
  {
    icon: "🚜",
    title: "View equipment",
    description: "Inspect the workshop equipment list and current statuses.",
    permissionKey: "view_equipment",
  },
  {
    icon: "🔧",
    title: "Add maintenance logs",
    description: "Create new maintenance and repair entries.",
    permissionKey: "add_maintenance",
  },
  {
    icon: "✏️",
    title: "Edit equipment records",
    description: "Update equipment model, location, status.",
    permissionKey: "edit_equipment",
  },
  {
    icon: "✅",
    title: "Close work orders",
    description: "Mark work orders as completed.",
    permissionKey: "close_work_orders",
  },
  {
    icon: "📷",
    title: "Upload inspection photos",
    description: "Attach photos to inspection records.",
    permissionKey: "upload_photos",
  },
];

export default async function TechnicianHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "technician") redirect("/post-login");

  await logActivity(user, "view_dashboard", "Opened technician dashboard", "technician");

  return (
    <DashboardShell
      title="Technician Dashboard"
      subtitle="Daily workshop operations"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <RoleHome
        role={user.role}
        greeting={`Welcome back`}
        capabilities={CAPS}
      />
    </DashboardShell>
  );
}