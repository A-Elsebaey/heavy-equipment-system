import { redirect } from "next/navigation";
import { getCurrentUser, type Role } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PostLoginPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  redirect(routeForRole(user.role));
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