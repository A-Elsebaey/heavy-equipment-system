"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Account {
  id: number;
  username: string;
  role: string;
  displayName: string | null;
  isActive: boolean;
  createdAt: Date | string;
}

const PROTECTED_ROLES = new Set(["super_admin", "admin"]);

export default function AccountsManager({
  initialAccounts,
}: {
  initialAccounts: Account[];
}) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [editing, setEditing] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, body: Record<string, unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Update failed");
        return false;
      }
      return true;
    } catch {
      setError("Network error");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this account permanently? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/accounts?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Delete failed");
      } else {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = async (a: Account) => {
    const next = !a.isActive;
    const ok = await update(a.id, { isActive: next });
    if (ok) {
      setAccounts((prev) =>
        prev.map((p) => (p.id === a.id ? { ...p, isActive: next } : p))
      );
    }
  };

  const startEdit = (a: Account) => {
    setEditing(a.id);
    setEditUsername(a.username);
    setEditDisplayName(a.displayName ?? "");
    setEditPassword("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    const body: Record<string, unknown> = {
      username: editUsername,
      displayName: editDisplayName,
    };
    if (editPassword) body.password = editPassword;
    const ok = await update(editing, body);
    if (ok) {
      setAccounts((prev) =>
        prev.map((p) =>
          p.id === editing
            ? {
                ...p,
                username: editUsername,
                displayName: editDisplayName || null,
              }
            : p
        )
      );
      setEditing(null);
      router.refresh();
    }
  };

  return (
    <>
      {error && (
        <div
          style={{
            background: "rgba(220, 38, 38, 0.12)",
            border: "1px solid rgba(220, 38, 38, 0.4)",
            color: "#fca5a5",
            padding: "0.55rem 0.75rem",
            borderRadius: 8,
            fontSize: "0.88rem",
            marginBottom: 12,
          }}
        >
          ⚠ {error}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Display name</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => {
              const isProtected = PROTECTED_ROLES.has(a.role);
              return (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>
                    {editing === a.id ? (
                      <input
                        className="input"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        style={{ maxWidth: 160 }}
                      />
                    ) : (
                      <code>{a.username}</code>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">{a.role}</span>
                  </td>
                  <td>
                    {editing === a.id ? (
                      <input
                        className="input"
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        placeholder="Full name"
                        style={{ maxWidth: 200 }}
                      />
                    ) : (
                      a.displayName ?? "—"
                    )}
                  </td>
                  <td>
                    {a.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Disabled</span>
                    )}
                  </td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: "right" }}>
                    {editing === a.id ? (
                      <>
                        <button
                          className="btn btn-success"
                          style={{ padding: "0.35rem 0.7rem", fontSize: "0.82rem", marginRight: 6 }}
                          onClick={saveEdit}
                          disabled={busyId === a.id}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: "0.35rem 0.7rem", fontSize: "0.82rem" }}
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </button>
                        {editing === a.id && (
                          <div style={{ marginTop: 8 }}>
                            <input
                              className="input"
                              type="password"
                              placeholder="New password (optional)"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              style={{ maxWidth: 220 }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: "0.35rem 0.7rem", fontSize: "0.82rem", marginRight: 6 }}
                          onClick={() => toggleActive(a)}
                          disabled={busyId === a.id}
                          title={a.isActive ? "Disable this account" : "Reactivate this account"}
                        >
                          {a.isActive ? "Disable" : "Reactivate"}
                        </button>
                        {!isProtected && (
                          <>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "0.35rem 0.7rem", fontSize: "0.82rem", marginRight: 6 }}
                              onClick={() => startEdit(a)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: "0.35rem 0.7rem", fontSize: "0.82rem" }}
                              onClick={() => remove(a.id)}
                              disabled={busyId === a.id}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}