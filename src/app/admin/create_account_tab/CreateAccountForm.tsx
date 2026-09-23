"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RoleOption {
  value: string;
  label: string;
}

export default function CreateAccountForm({ roles }: { roles: RoleOption[] }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(roles[0]?.value ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role, displayName }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Failed to create account");
      } else {
        setSuccess(`Account ${username} created successfully`);
        setUsername("");
        setDisplayName("");
        setPassword("");
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 540 }}>
      <div style={{ marginBottom: 14 }}>
        <label className="label" htmlFor="role">
          Account type
        </label>
        <select
          id="role"
          className="select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <small style={{ color: "#8a96b6" }}>
          Choose the precise role for this account.
        </small>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="label" htmlFor="displayName">
          Display name (optional)
        </label>
        <input
          id="displayName"
          className="input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Full name"
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={50}
          autoComplete="off"
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={4}
          autoComplete="new-password"
        />
        <small style={{ color: "#8a96b6" }}>
          Will be hashed with bcrypt (12 rounds) before storage.
        </small>
      </div>

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
      {success && (
        <div
          style={{
            background: "rgba(22, 163, 74, 0.12)",
            border: "1px solid rgba(22, 163, 74, 0.4)",
            color: "#86efac",
            padding: "0.55rem 0.75rem",
            borderRadius: 8,
            fontSize: "0.88rem",
            marginBottom: 12,
          }}
        >
          ✓ {success}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="spinner" /> Creating...
          </>
        ) : (
          <>➕ Create account</>
        )}
      </button>
    </form>
  );
}