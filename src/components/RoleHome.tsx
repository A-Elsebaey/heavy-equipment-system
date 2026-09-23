"use client";

import { useEffect, useState } from "react";

interface PermState {
  permissions: Record<string, boolean>;
  role: string;
  username: string;
  displayName: string | null;
}

export default function RoleHome({
  role,
  greeting,
  capabilities,
  permissionsEndpoint = "/api/me/permissions",
}: {
  role: string;
  greeting: string;
  capabilities: Array<{
    icon: string;
    title: string;
    description: string;
    permissionKey: string | null;
  }>;
  permissionsEndpoint?: string;
}) {
  const [state, setState] = useState<PermState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(permissionsEndpoint)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setState(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [permissionsEndpoint]);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          {greeting}
          {state && (
            <span
              style={{
                color: "#8a96b6",
                fontWeight: 500,
                marginLeft: 8,
                fontSize: "0.95rem",
              }}
            >
              — {state.displayName ?? state.username}
            </span>
          )}
        </h2>
        <span className="badge badge-info">{role.replace("_", " ")}</span>
      </div>
      <p style={{ color: "#8a96b6", marginTop: 0 }}>
        Your account is active. Below is a list of tasks you can perform
        inside the system. Items shown in red are not granted to your
        account.
      </p>
      <div
        className="grid-cards"
        style={{ marginTop: 14 }}
      >
        {capabilities.map((c) => {
          const granted =
            !c.permissionKey || state?.permissions?.[c.permissionKey] === true;
          return (
            <div
              key={c.title}
              className="stat-card"
              style={{
                borderColor: granted ? "#233057" : "#7f1d1d",
                opacity: granted ? 1 : 0.55,
              }}
            >
              <div style={{ fontSize: 22 }}>{c.icon}</div>
              <div className="stat-value" style={{ fontSize: "1rem" }}>
                {c.title}
              </div>
              <div className="stat-label">{c.description}</div>
              <div style={{ marginTop: 10 }}>
                {loading ? (
                  <small style={{ color: "#8a96b6" }}>Checking…</small>
                ) : granted ? (
                  <span className="badge badge-success">Allowed</span>
                ) : (
                  <span className="badge badge-danger">
                    Restricted by admin
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}