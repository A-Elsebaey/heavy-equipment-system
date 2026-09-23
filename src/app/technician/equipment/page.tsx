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

export default async function EquipmentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "technician") redirect("/post-login");

  await logActivity(user, "view_equipment", "Opened equipment list", "technician/equipment");

  // Demo equipment
  const equipment = [
    { id: "EX-001", name: "Caterpillar 320D Excavator", status: "Operational", hours: 4321 },
    { id: "EX-002", name: "Komatsu PC210 Excavator", status: "Maintenance", hours: 3110 },
    { id: "LD-014", name: "Volvo L120 Loader", status: "Operational", hours: 5612 },
    { id: "DT-007", name: "Caterpillar D6T Bulldozer", status: "Down", hours: 6210 },
    { id: "GR-022", name: "John Deere 770G Grader", status: "Operational", hours: 1820 },
  ];

  return (
    <DashboardShell
      title="Equipment"
      subtitle="Workshop equipment registry"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">🚜 Equipment registry</h2>
          <span className="badge badge-info">{equipment.length} units</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Engine hours</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((e) => (
                <tr key={e.id}>
                  <td>
                    <code>{e.id}</code>
                  </td>
                  <td>{e.name}</td>
                  <td>
                    {e.status === "Operational" ? (
                      <span className="badge badge-success">Operational</span>
                    ) : e.status === "Maintenance" ? (
                      <span className="badge badge-warning">Maintenance</span>
                    ) : (
                      <span className="badge badge-danger">Down</span>
                    )}
                  </td>
                  <td>{e.hours.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}