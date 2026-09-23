import Link from "next/link";

export const metadata = {
  title: "Documentation — Workshop MS",
};

export default function DocsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#e8ecf5",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            color: "#8a96b6",
            fontSize: "0.85rem",
            textDecoration: "underline",
          }}
        >
          ← Back to installation center
        </Link>
        <h1 style={{ marginTop: 12, fontSize: "1.8rem", fontWeight: 800 }}>
          📖 System documentation
        </h1>
        <p style={{ color: "#8a96b6" }}>
          Operating manual for the Heavy Equipment Workshop Management
          System.
        </p>

        <section className="panel" style={{ marginTop: 18 }}>
          <h2 className="panel-title">1. First-time installation</h2>
          <ol style={{ lineHeight: 1.7, color: "#cbd5e1" }}>
            <li>
              Open the public URL of the system. The landing page will begin
              downloading the system files from the server automatically.
            </li>
            <li>
              Wait for the progress bar to reach 100% — the page will show a
              &ldquo;Download complete&rdquo; state.
            </li>
            <li>
              Click <strong>Start installation</strong>. The installer will
              prepare the encrypted database, create default accounts and
              configure security protocols.
            </li>
            <li>
              After the installation completes, click{" "}
              <strong>Windows shortcut</strong>, <strong>macOS shortcut</strong> or{" "}
              <strong>Linux shortcut</strong> to download a desktop icon
              pointing to the login page of the system.
            </li>
          </ol>
        </section>

        <section className="panel" style={{ marginTop: 16 }}>
          <h2 className="panel-title">2. Default credentials</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>sebaey_super</code>
                </td>
                <td>
                  <code>A@a161984</code>
                </td>
                <td>Super Admin</td>
              </tr>
              <tr>
                <td>
                  <code>admin</code>
                </td>
                <td>
                  <code>@$123</code>
                </td>
                <td>Admin</td>
              </tr>
            </tbody>
          </table>
          <p style={{ color: "#8a96b6", marginTop: 8 }}>
            The admin account can provision further accounts (technicians,
            accountants, owners) from the <em>Create account</em> tab.
          </p>
        </section>

        <section className="panel" style={{ marginTop: 16 }}>
          <h2 className="panel-title">3. Super admin capabilities</h2>
          <ul style={{ lineHeight: 1.7, color: "#cbd5e1" }}>
            <li>
              <strong>what_can_i_do</strong>: complete description of every
              super-admin task.
            </li>
            <li>
              <strong>admin_tracker_tab</strong>: traffic analytics for the
              admin account.
            </li>
            <li>
              <strong>technician_tracker_tab</strong>: analytics for
              technicians.
            </li>
            <li>
              <strong>accountant_tracker_tab</strong>: analytics for
              accountants.
            </li>
            <li>
              <strong>fst_owner_tracker_tab</strong>: analytics for Owner 1.
            </li>
            <li>
              <strong>scd_owner_tracker_tab</strong>: analytics for Owner 2.
            </li>
            <li>
              <strong>trd_owner_tracker_tab</strong>: analytics for Owner 3.
            </li>
          </ul>
        </section>

        <section className="panel" style={{ marginTop: 16 }}>
          <h2 className="panel-title">4. Admin capabilities</h2>
          <ul style={{ lineHeight: 1.7, color: "#cbd5e1" }}>
            <li>
              <strong>create_account_tab</strong>: create technician,
              accountant and owner accounts.
            </li>
            <li>
              <strong>accounts_management_tab</strong>: disable, reactivate,
              edit or delete accounts.
            </li>
            <li>
              <strong>accounts_permissions_tab</strong>: toggle per-account
              permissions on/off for technicians and accountants.
            </li>
          </ul>
        </section>

        <section className="panel" style={{ marginTop: 16 }}>
          <h2 className="panel-title">5. Security model</h2>
          <ul style={{ lineHeight: 1.7, color: "#cbd5e1" }}>
            <li>
              All passwords are stored using <strong>bcrypt (12 rounds)</strong>.
            </li>
            <li>
              Sessions are stored server-side with HttpOnly cookies.
            </li>
            <li>
              Every login attempt (success / failure) is recorded in the{" "}
              <code>login_logs</code> table.
            </li>
            <li>
              Every meaningful action (creating accounts, toggling
              permissions, viewing pages) is recorded in the{" "}
              <code>activity_logs</code> table.
            </li>
            <li>
              All API endpoints verify the current session role before
              returning data.
            </li>
            <li>
              PostgreSQL is reachable only through the application server
              via the <code>DATABASE_URL</code> environment variable.
            </li>
          </ul>
        </section>

        <section className="panel" style={{ marginTop: 16 }}>
          <h2 className="panel-title">6. Routine maintenance</h2>
          <ul style={{ lineHeight: 1.7, color: "#cbd5e1" }}>
            <li>
              Use the super admin tracker tabs to review activity at any
              time.
            </li>
            <li>
              Disable suspicious accounts from the admin
              <em> Accounts management</em> page.
            </li>
            <li>
              Reset an account password from the same page.
            </li>
            <li>
              Update the schema at any time with{" "}
              <code>npx drizzle-kit push</code>.
            </li>
          </ul>
        </section>

        <footer
          style={{
            color: "#566380",
            fontSize: "0.85rem",
            textAlign: "center",
            marginTop: 24,
          }}
        >
          Heavy Equipment Workshop Management System · Documentation v1.0
        </footer>
      </div>
    </main>
  );
}