import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "what_can_i_do", label: "What can I do", href: "/super/what_can_i_do", icon: "📘" },
  { key: "admin_tracker", label: "Admin tracker", href: "/super/admin_tracker_tab", icon: "🛡️" },
  { key: "technician_tracker", label: "Technician tracker", href: "/super/technician_tracker_tab", icon: "🛠️" },
  { key: "accountant_tracker", label: "Accountant tracker", href: "/super/accountant_tracker_tab", icon: "📊" },
  { key: "fst_owner", label: "Owner 1 tracker", href: "/super/fst_owner_tracker_tab", icon: "👤" },
  { key: "scd_owner", label: "Owner 2 tracker", href: "/super/scd_owner_tracker_tab", icon: "👤" },
  { key: "trd_owner", label: "Owner 3 tracker", href: "/super/trd_owner_tracker_tab", icon: "👤" },
];

const CAPABILITIES = [
  {
    title: "Full system oversight",
    description:
      "View the entire workshop management system from one place and confirm every action taken by every account type.",
    tasks: [
      "Open the super admin landing page to see the quick links to all tracker tabs.",
      "Read each account type's tracker summary at a glance.",
    ],
  },
  {
    title: "Admin traffic analytics — admin_tracker_tab",
    description:
      "Monitor every login and every action performed by the regular administrator account (admin).",
    tasks: [
      "Inspect the total number of admin logins.",
      "Review the list of login attempts (successful and failed).",
      "Audit every action the admin performed (creating accounts, toggling permissions, disabling accounts, etc.).",
    ],
  },
  {
    title: "Technician traffic analytics — technician_tracker_tab",
    description:
      "Track every login and every action performed by any technician account in the system.",
    tasks: [
      "View the count of technicians that have signed in.",
      "Inspect login history for technicians.",
      "Audit their daily workshop activity (work orders, equipment updates, etc.).",
    ],
  },
  {
    title: "Accountant traffic analytics — accountant_tracker_tab",
    description:
      "Track every login and every action performed by any accountant account.",
    tasks: [
      "Review how many times accountants have signed in.",
      "Audit financial-related actions: invoices, expenses, reports.",
      "Identify unusual activity patterns or failed login attempts.",
    ],
  },
  {
    title: "First owner tracker — fst_owner_tracker_tab",
    description:
      "Monitor every login and every action of the Owner 1 account.",
    tasks: [
      "See total sign-ins for Owner 1.",
      "Audit which pages Owner 1 visited and which actions were taken.",
      "Review timestamps of each activity to spot suspicious behaviour.",
    ],
  },
  {
    title: "Second owner tracker — scd_owner_tracker_tab",
    description:
      "Monitor every login and every action of the Owner 2 account.",
    tasks: [
      "See total sign-ins for Owner 2.",
      "Audit which pages Owner 2 visited and which actions were taken.",
      "Review timestamps of each activity to spot suspicious behaviour.",
    ],
  },
  {
    title: "Third owner tracker — trd_owner_tracker_tab",
    description:
      "Monitor every login and every action of the Owner 3 account.",
    tasks: [
      "See total sign-ins for Owner 3.",
      "Audit which pages Owner 3 visited and which actions were taken.",
      "Review timestamps of each activity to spot suspicious behaviour.",
    ],
  },
  {
    title: "Security & auditing responsibilities",
    description:
      "As super admin, you are responsible for confirming the security of the workshop system.",
    tasks: [
      "Review failed logins on every tracker tab.",
      "Detect accounts that never sign in.",
      "Coordinate with the regular admin to disable compromised accounts.",
    ],
  },
];

export default async function SuperWhatCanIDoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "super_admin") redirect("/post-login");

  return (
    <DashboardShell
      title="What can I do"
      subtitle="Complete breakdown of super admin capabilities"
      username={user.username}
      roleLabel={ROLE_LABELS[user.role]}
      nav={NAV}
    >
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">📘 Super Admin capabilities</h2>
          <span className="badge badge-warning">sebaey_super</span>
        </div>
        <p style={{ color: "#cbd5e1", marginTop: 0 }}>
          The super admin account has full visibility across the entire
          workshop management system. Your primary mission is to monitor
          activity and ensure system integrity. Below is a complete list of
          what you can do from this account.
        </p>
        <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
          {CAPABILITIES.map((c, idx) => (
            <div
              key={c.title}
              style={{
                background: "#1b2748",
                border: "1px solid #233057",
                borderRadius: 10,
                padding: "1rem 1.25rem",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.02rem",
                  color: "#fbbf24",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    background: "#f5a524",
                    color: "#0b1220",
                    borderRadius: 999,
                    width: 28,
                    height: 28,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                  }}
                >
                  {idx + 1}
                </span>
                {c.title}
              </h3>
              <p
                style={{
                  color: "#cbd5e1",
                  marginTop: 8,
                  marginBottom: 10,
                }}
              >
                {c.description}
              </p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 22,
                  color: "#8a96b6",
                  fontSize: "0.92rem",
                  lineHeight: 1.7,
                }}
              >
                {c.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}