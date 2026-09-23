import type { Role } from "@/lib/auth";

export interface PermissionDef {
  key: string;
  label: string;
  description: string;
  icon: string;
}

export const TECHNICIAN_PERMISSIONS: PermissionDef[] = [
  {
    key: "view_equipment",
    label: "View equipment",
    description: "Allow viewing the workshop equipment list and statuses.",
    icon: "👁️",
  },
  {
    key: "add_maintenance",
    label: "Add maintenance logs",
    description: "Allow creating new maintenance and repair records.",
    icon: "🔧",
  },
  {
    key: "edit_equipment",
    label: "Edit equipment records",
    description: "Allow editing equipment data (model, status, location, etc.).",
    icon: "✏️",
  },
  {
    key: "close_work_orders",
    label: "Close work orders",
    description: "Allow marking work orders as completed.",
    icon: "✅",
  },
  {
    key: "upload_photos",
    label: "Upload inspection photos",
    description: "Allow attaching photos to inspection records.",
    icon: "📷",
  },
];

export const ACCOUNTANT_PERMISSIONS: PermissionDef[] = [
  {
    key: "view_invoices",
    label: "View invoices",
    description: "Allow viewing customer and supplier invoices.",
    icon: "📄",
  },
  {
    key: "create_invoice",
    label: "Create invoices",
    description: "Allow creating new invoices.",
    icon: "➕",
  },
  {
    key: "view_reports",
    label: "View financial reports",
    description: "Allow opening revenue, expense, and profit reports.",
    icon: "📊",
  },
  {
    key: "export_data",
    label: "Export data",
    description: "Allow exporting financial data to CSV / PDF.",
    icon: "📤",
  },
  {
    key: "approve_payments",
    label: "Approve payments",
    description: "Allow marking payments as approved.",
    icon: "💳",
  },
];

export function permissionsForRole(role: Role): PermissionDef[] {
  if (role === "technician") return TECHNICIAN_PERMISSIONS;
  if (role === "accountant") return ACCOUNTANT_PERMISSIONS;
  return [];
}