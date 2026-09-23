"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: string;
}

export default function DashboardShell({
  title,
  subtitle,
  username,
  roleLabel,
  nav,
  children,
}: {
  title: string;
  subtitle: string;
  username: string;
  roleLabel: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: open ? 260 : 70,
          background: "#0e1628",
          borderRight: "1px solid #1c2748",
          transition: "width 0.2s ease",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div
          style={{
            padding: "1rem 1rem",
            borderBottom: "1px solid #1c2748",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #f5a524, #ef6c00)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🏗️
          </div>
          {open && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  whiteSpace: "nowrap",
                }}
              >
                Workshop MS
              </div>
              <div
                style={{
                  color: "#8a96b6",
                  fontSize: "0.75rem",
                  whiteSpace: "nowrap",
                }}
              >
                Heavy Equipment
              </div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <a
                key={item.key}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0.6rem 0.85rem",
                  marginBottom: 4,
                  borderRadius: 8,
                  color: active ? "#f5a524" : "#cbd5e1",
                  background: active ? "#1a2748" : "transparent",
                  fontSize: "0.9rem",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                {open && (
                  <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
                )}
              </a>
            );
          })}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          style={{
            border: "none",
            background: "#16213d",
            color: "#cbd5e1",
            padding: "0.55rem",
            margin: "0.5rem",
            borderRadius: 8,
            fontSize: "0.85rem",
          }}
        >
          {open ? "← Collapse" : "→"}
        </button>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            background: "#0e1628",
            borderBottom: "1px solid #1c2748",
            padding: "0.9rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
              {title}
            </h1>
            <p style={{ margin: 0, color: "#8a96b6", fontSize: "0.82rem" }}>
              {subtitle}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {username}
              </div>
              <div
                style={{ color: "#8a96b6", fontSize: "0.75rem" }}
              >
                {roleLabel}
              </div>
            </div>
            <button
              className="btn btn-danger"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}
            >
              {loggingOut ? "..." : "Logout"}
            </button>
          </div>
        </header>
        <main style={{ padding: "1.5rem", flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}