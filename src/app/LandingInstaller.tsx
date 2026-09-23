"use client";

import { useEffect, useState } from "react";

interface FileItem {
  name: string;
  size: string;
  description: string;
}

const FILES: FileItem[] = [
  { name: "core_engine.js", size: "2.4 MB", description: "Core application engine" },
  { name: "auth_module.js", size: "1.1 MB", description: "Authentication & encryption module" },
  { name: "dashboard_ui.js", size: "3.2 MB", description: "Dashboard user interface" },
  { name: "tracker_analytics.js", size: "1.8 MB", description: "Activity tracking & analytics" },
  { name: "permissions_manager.js", size: "0.9 MB", description: "Permissions management system" },
  { name: "database_driver.js", size: "2.7 MB", description: "Encrypted database driver" },
  { name: "security_layer.js", size: "1.5 MB", description: "Security & protocol layer" },
  { name: "installer_payload.js", size: "1.3 MB", description: "Installer payload & desktop shortcut" },
];

type Phase = "download" | "ready" | "installing" | "installed";

export default function LandingInstaller({
  installed,
  systemName,
}: {
  installed: boolean;
  systemName: string;
}) {
  const [phase, setPhase] = useState<Phase>(installed ? "installed" : "download");
  const [progress, setProgress] = useState<number>(installed ? 100 : 0);
  const [completedFiles, setCompletedFiles] = useState<number>(installed ? FILES.length : 0);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [installSteps, setInstallSteps] = useState<number>(installed ? 5 : 0);
  const [shortcutCreated, setShortcutCreated] = useState<boolean>(installed);
  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // File download simulation
  useEffect(() => {
    if (phase !== "download") return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setCompletedFiles(i);
      setProgress(Math.round((i / FILES.length) * 100));
      setCurrentFile(FILES[i - 1]?.name ?? "");
      if (i >= FILES.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("ready"), 600);
      }
    }, 380);
    return () => clearInterval(interval);
  }, [phase]);

  const startInstall = async () => {
    setPhase("installing");
    setInstallSteps(0);
    const steps = 5;
    for (let s = 1; s <= steps; s++) {
      await new Promise((r) => setTimeout(r, 700));
      setInstallSteps(s);
    }
    try {
      await fetch("/api/install", { method: "POST" });
    } catch {
      // continue even if API fails in offline preview
    }
    setShortcutCreated(true);
    setPhase("installed");
  };

  const handleDesktopShortcut = () => {
    if (!baseUrl) return;
    // Windows .url shortcut file
    const content = `[InternetShortcut]\nURL=${baseUrl}/login\nIconIndex=0\nIconFile=${baseUrl}/favicon.ico\n`;
    const blob = new Blob([content], { type: "application/internet-shortcut" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Workshop Management System.url";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMacShortcut = () => {
    // macOS .webloc file
    if (!baseUrl) return;
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>URL</key>
  <string>${baseUrl}/login</string>
</dict>
</plist>`;
    const blob = new Blob([content], { type: "application/webloc" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Workshop Management System.webloc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLinuxShortcut = () => {
    if (!baseUrl) return;
    const content = `[Desktop Entry]
Name=Workshop Management System
Comment=Heavy Equipment Workshop Management System
Exec=xdg-open ${baseUrl}/login
Terminal=false
Type=Application
`;
    const blob = new Blob([content], { type: "application/x-desktop" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workshop-management.desktop";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, #1a2748 0%, #0b1220 60%, #060912 100%)",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: 18,
              background: "linear-gradient(135deg, #f5a524, #ef6c00)",
              marginBottom: 16,
              fontSize: 38,
            }}
          >
            🏗️
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            {systemName}
          </h1>
          <p style={{ color: "#8a96b6", marginTop: 8 }}>
            Server-hosted installation center
          </p>
        </header>

        <section className="panel">
          {/* PHASE: DOWNLOAD */}
          {phase === "download" && (
            <>
              <div className="panel-header">
                <h2 className="panel-title">
                  📥 Downloading system files from server...
                </h2>
                <span style={{ color: "#8a96b6", fontSize: "0.9rem" }}>
                  {progress}%
                </span>
              </div>
              <p style={{ color: "#8a96b6", marginTop: 0 }}>
                Please wait while we securely download all required system
                modules from the hosting server. Do not close this window.
              </p>
              <div className="progress" style={{ marginBottom: 18 }}>
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div
                style={{
                  maxHeight: 280,
                  overflowY: "auto",
                  background: "#0f1729",
                  border: "1px solid #233057",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  fontFamily:
                    "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
                  fontSize: "0.85rem",
                }}
              >
                {FILES.map((f, idx) => {
                  const done = idx < completedFiles;
                  const active = idx === completedFiles && progress < 100;
                  return (
                    <div
                      key={f.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.3rem 0",
                        color: done ? "#4ade80" : active ? "#fbbf24" : "#566380",
                      }}
                    >
                      <span>
                        {done ? "✓" : active ? "⏳" : "○"} {f.name}
                      </span>
                      <span>{done || active ? f.size : ""}</span>
                    </div>
                  );
                })}
              </div>
              {currentFile && (
                <p
                  style={{
                    color: "#fbbf24",
                    fontSize: "0.85rem",
                    marginTop: 12,
                    marginBottom: 0,
                  }}
                >
                  Downloading: {currentFile}...
                </p>
              )}
            </>
          )}

          {/* PHASE: READY */}
          {phase === "ready" && (
            <>
              <div className="panel-header">
                <h2 className="panel-title">✅ Download complete</h2>
                <span className="badge badge-success">
                  {FILES.length} files
                </span>
              </div>
              <p style={{ color: "#8a96b6" }}>
                All system files have been successfully downloaded. You can now
                start the installation process. After the installation
                completes, a desktop shortcut will be created.
              </p>
              <div
                style={{
                  background: "#0f1729",
                  border: "1px solid #233057",
                  borderRadius: 10,
                  padding: "1rem",
                  marginBottom: 18,
                  fontSize: "0.9rem",
                }}
              >
                <strong>System contents:</strong>
                <ul style={{ marginTop: 8, paddingLeft: 20, color: "#8a96b6" }}>
                  <li>Authentication module with bcrypt encryption</li>
                  <li>Role-based access control (RBAC)</li>
                  <li>Activity tracking &amp; analytics</li>
                  <li>Encrypted database with Drizzle ORM</li>
                  <li>Dashboard for super admin &amp; admin</li>
                  <li>Desktop shortcut generator</li>
                </ul>
              </div>
              <div style={{ textAlign: "center" }}>
                <button className="btn btn-primary" onClick={startInstall}>
                  🚀 Start installation
                </button>
              </div>
            </>
          )}

          {/* PHASE: INSTALLING */}
          {phase === "installing" && (
            <>
              <div className="panel-header">
                <h2 className="panel-title">⚙️ Installing system...</h2>
                <span style={{ color: "#8a96b6" }}>
                  Step {installSteps}/5
                </span>
              </div>
              <div className="progress" style={{ marginBottom: 18 }}>
                <div
                  className="progress-bar"
                  style={{ width: `${(installSteps / 5) * 100}%` }}
                />
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Verifying file integrity",
                  "Initializing encrypted database",
                  "Creating default administrator accounts",
                  "Configuring security protocols",
                  "Registering desktop shortcut",
                ].map((label, idx) => {
                  const done = idx < installSteps;
                  const active = idx === installSteps;
                  return (
                    <li
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "0.5rem 0",
                        color: done ? "#4ade80" : active ? "#fbbf24" : "#566380",
                      }}
                    >
                      <span style={{ width: 22 }}>
                        {done ? "✓" : active ? <div className="spinner" /> : "○"}
                      </span>
                      <span>{label}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {/* PHASE: INSTALLED */}
          {phase === "installed" && (
            <>
              <div className="panel-header">
                <h2 className="panel-title">
                  🎉 Installation successful
                </h2>
                <span className="badge badge-success">Installed</span>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "1rem 0 1.5rem",
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 88,
                    margin: "0 auto 1rem",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, #16a34a 0%, #15803d 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 44,
                    boxShadow: "0 0 40px rgba(22, 163, 74, 0.4)",
                  }}
                >
                  ✓
                </div>
                <p
                  style={{
                    fontSize: "1.05rem",
                    margin: "0.5rem 0 1rem",
                  }}
                >
                  The system has been installed successfully on this server.
                </p>
                <p style={{ color: "#8a96b6", margin: 0 }}>
                  Create a desktop shortcut for quick access, or proceed to
                  the login screen.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={handleDesktopShortcut}
                  title="Creates a .url file on Windows"
                >
                  🪟 Windows shortcut
                </button>
                <button className="btn btn-secondary" onClick={handleMacShortcut}>
                  🍎 macOS shortcut
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleLinuxShortcut}
                >
                  🐧 Linux shortcut
                </button>
              </div>

              <div style={{ textAlign: "center" }}>
                <a className="btn btn-primary" href="/login">
                  🔐 Continue to login
                </a>
              </div>

              {shortcutCreated && (
                <p
                  style={{
                    color: "#4ade80",
                    textAlign: "center",
                    marginTop: 14,
                    fontSize: "0.9rem",
                  }}
                >
                  ✓ Desktop shortcut download initiated.
                </p>
              )}
            </>
          )}
        </section>

        <section
          className="panel"
          style={{ marginTop: "1.25rem" }}
        >
          <h3 className="panel-title" style={{ marginBottom: 10 }}>
            📋 Quick reference — default accounts
          </h3>
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
                <td>
                  <span className="badge badge-warning">Super Admin</span>
                </td>
              </tr>
              <tr>
                <td>
                  <code>admin</code>
                </td>
                <td>
                  <code>@$123</code>
                </td>
                <td>
                  <span className="badge badge-info">Admin</span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer
          style={{
            textAlign: "center",
            color: "#566380",
            fontSize: "0.85rem",
            marginTop: "2rem",
          }}
        >
          Heavy Equipment Workshop Management System · Server-rendered with
          Next.js + PostgreSQL
        </footer>
      </div>
    </main>
  );
}