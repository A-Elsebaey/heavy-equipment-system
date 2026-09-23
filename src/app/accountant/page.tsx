import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS, logActivity } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import RoleHome from "@/components/RoleHome";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "home", label: "Dashboard", href: "/accountant", icon: "🏠" },
  { key: "invoices", label: "Invoices", href: "/accountant/invoices", icon: "📄" },
  { key: "reports", label: "Reports", href: "/accountant/reports", icon: "📊" },
  { key: "payments", label: "Payments", href: "/accountant/payments", icon: "💳" },
];

const CAPS = [
  {
    icon: "📄",
    title: "View invoices",
    description: "Open existing customer and supplier invoices.",
    permissionKey: "view_invoices",
  },
  {
    icon: "➕",
    title: "Create invoices",
    description: "Create new invoices and send to clients.",
    permissionKey: "create_invoice",
  },
  {
    icon: "📊",
    title: "View financial reports",
    description: "Open revenue, expense, and profit reports.",
    permissionKey: "view_reports",
  },
  {
    icon: "📤",
    title: "Export data",
    description: "Export financial data to CSV or PDF.",
    permissionKey: "export_data",
  },
  {
    icon: "💳",
    title: "Approve payments",
    description: "Approve pending payments to suppliers.",
    permissionKey: "approve_payments",
  },
];

export default async function AccountantHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "accountant") redirect("/post-login");

  await logActivity(user, "view_dashboard", "Opened accountant dashboard", "accountant");

  return (
    <DashboardShell
      title="Accountant Dashboard"
      subtitle="Financial operations"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <RoleHome
        role={user.role}
        greeting="Welcome back"
        capabilities={CAPS}
      />
    </DashboardShell>
  );
}