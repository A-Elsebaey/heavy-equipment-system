import { redirect } from "next/navigation";
import { getCurrentUser, ROLE_LABELS, type Role } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(routeForRole(user.role));
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, #1a2748 0%, #0b1220 60%, #060912 100%)",
        display: "grid",
        placeItems: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#16213d",
          border: "1px solid #233057",
          borderRadius: 16,
          padding: "2rem",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div
            style={{
              display: "inline-flex",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #f5a524, #ef6c00)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              marginBottom: 12,
            }}
          >
            🔐
          </div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800 }}>
            Workshop Management System
          </h1>
          <p style={{ color: "#8a96b6", marginTop: 6, fontSize: "0.92rem" }}>
            Sign in to continue
          </p>
        </div>
        <LoginForm />
        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid #233057",
            fontSize: "0.82rem",
            color: "#8a96b6",
          }}
        >
          <strong style={{ color: "#cbd5e1" }}>Default credentials:</strong>
          <div style={{ marginTop: 6 }}>
            Super Admin: <code>sebaey_super</code> / <code>A@a161984</code>
          </div>
          <div>
            Admin: <code>admin</code> / <code>@$123</code>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <a
            href="/"
            style={{ color: "#8a96b6", fontSize: "0.85rem", textDecoration: "underline" }}
          >
            ← Back to installation center
          </a>
        </div>
      </div>
    </main>
  );
}

function routeForRole(role: Role): string {
  switch (role) {
    case "super_admin":
      return "/super";
    case "admin":
      return "/admin";
    case "technician":
      return "/technician";
    case "accountant":
      return "/accountant";
    case "fst_owner":
      return "/owner/first";
    case "scd_owner":
      return "/owner/second";
    case "trd_owner":
      return "/owner/third";
    default:
      return "/login";
  }
}