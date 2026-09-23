"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TECHNICIAN_PERMISSIONS,
  ACCOUNTANT_PERMISSIONS,
  type PermissionDef,
} from "@/lib/permissions";

interface Account {
  id: number;
  username: string;
  displayName: string | null;
  role: string;
  isActive: boolean;
}

export default function PermissionsManager({
  accounts,
  initialPerms,
}: {
  accounts: Account[];
  initialPerms: Record<number, Record<string, boolean>>;
}) {
  const router = useRouter();
  const [perms, setPerms] = useState<Record<number, Record<string, boolean>>>(
    initialPerms
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const defsFor = (role: string): PermissionDef[] => {
    if (role === "technician") return TECHNICIAN_PERMISSIONS;
    if (role === "accountant") return ACCOUNTANT_PERMISSIONS;
    return [];
  };

  const toggle = (userId: number, key: string, value: boolean) => {
    setPerms((prev) => {
      const next = { ...prev };
      next[userId] = { ...(prev[userId] ?? {}), [key]: value };
      return next;
    });
  };

  const save = async (userId: number) => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          permissions: perms[userId] ?? {},
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStatus({ type: "error", msg: data.error ?? "Save failed" });
      } else {
        setStatus({ type: "success", msg: "Permissions saved." });
        router.refresh();
      }
    } catch {
      setStatus({ type: "error", msg: "Network error" });
    } finally {
      setBusy(false);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Account[]>();
    for (const a of accounts) {
      const arr = map.get(a.role) ?? [];
      arr.push(a);
      map.set(a.role, arr);
    }
    return map;
  }, [accounts]);

  return (
    <>
      {status && (
        <div
          style={{
            background:
              status.type === "success"
                ? "rgba(22, 163, 74, 0.12)"
                : "rgba(220, 38, 38, 0.12)",
            border: `1px solid ${
              status.type === "success"
                ? "rgba(22, 163, 74, 0.4)"
                : "rgba(220, 38, 38, 0.4)"
            }`,
            color: status.type === "success" ? "#86efac" : "#fca5a5",
            padding: "0.55rem 0.75rem",
            borderRadius: 8,
            fontSize: "0.88rem",
            marginBottom: 12,
          }}
        >
          {status.type === "success" ? "✓" : "⚠"} {status.msg}
        </div>
      )}

      {Array.from(grouped.entries()).map(([role, accs]) => (
        <div key={role} style={{ marginBottom: 24 }}>
          <h3
            style={{
              margin: "0 0 10px",
              color: "#fbbf24",
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {role} accounts ({accs.length})
          </h3>
          <div style={{ display: "grid", gap: 14 }}>
            {accs.map((a) => {
              const defs = defsFor(a.role);
              const current = perms[a.id] ?? {};
              return (
                <div
                  key={a.id}
                  style={{
                    background: "#1b2748",
                    border: "1px solid #233057",
                    borderRadius: 10,
                    padding: "1rem 1.1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "1.02rem" }}>
                        {a.displayName ?? a.username}
                      </strong>
                      <span
                        style={{
                          color: "#8a96b6",
                          marginLeft: 8,
                          fontSize: "0.85rem",
                        }}
                      >
                        (<code>{a.username}</code>)
                      </span>
                      {!a.isActive && (
                        <span
                          className="badge badge-danger"
                          style={{ marginLeft: 8 }}
                        >
                          Disabled
                        </span>
                      )}
                    </div>
                    <button
                      className="btn btn-success"
                      style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}
                      onClick={() => save(a.id)}
                      disabled={busy}
                    >
                      {busy ? "Saving..." : "💾 Save"}
                    </button>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                    }}
                  >
                    {defs.map((d) => {
                      const enabled = current[d.key] === true;
                      return (
                        <label
                          key={d.key}
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            background: "#0f1729",
                            border: "1px solid #233057",
                            padding: "0.6rem 0.75rem",
                            borderRadius: 8,
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{d.icon}</span>
                          <span style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>
                              {d.label}
                            </div>
                            <small style={{ color: "#8a96b6" }}>
                              {d.description}
                            </small>
                          </span>
                          <span className="toggle">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) =>
                                toggle(a.id, d.key, e.target.checked)
                              }
                            />
                            <span className="toggle-slider" />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}