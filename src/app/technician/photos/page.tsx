import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS, logActivity } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "home", label: "Dashboard", href: "/technician", icon: "🏠" },
  { key: "equipment", label: "Equipment", href: "/technician/equipment", icon: "🚜" },
  { key: "orders", label: "Work orders", href: "/technician/orders", icon: "📋" },
  { key: "photos", label: "Inspections", href: "/technician/photos", icon: "📷" },
];

export default async function PhotosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "technician") redirect("/post-login");

  await logActivity(user, "view_inspections", "Opened inspection photos", "technician/photos");

  return (
    <DashboardShell
      title="Inspections"
      subtitle="Inspection photos &amp; reports"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">📷 Inspection photos</h2>
        </div>
        <p style={{ color: "#8a96b6", marginTop: 0 }}>
          Upload photos taken during daily inspections. Each photo is
          timestamped and attached to the relevant equipment record.
        </p>
        <div
          style={{
            border: "2px dashed #233057",
            borderRadius: 12,
            padding: "2rem",
            textAlign: "center",
            color: "#8a96b6",
            background: "#0f1729",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
          <div>Drag photos here to upload, or click to select.</div>
          <small>(Photo upload module — UI demo only in this preview)</small>
        </div>
      </section>
    </DashboardShell>
  );
}