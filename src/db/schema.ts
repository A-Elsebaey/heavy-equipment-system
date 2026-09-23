import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";

// Users table - stores all account information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  // Roles: super_admin, admin, technician, accountant, fst_owner, scd_owner, trd_owner
  role: varchar("role", { length: 30 }).notNull(),
  displayName: varchar("display_name", { length: 150 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: integer("created_by"),
});

// Login logs - tracks all login attempts (success/fail)
export const loginLogs = pgTable("login_logs", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull(),
  role: varchar("role", { length: 30 }),
  success: boolean("success").notNull(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  attemptedAt: timestamp("attempted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Activity logs - tracks all actions performed by users
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  username: varchar("username", { length: 100 }).notNull(),
  role: varchar("role", { length: 30 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  description: text("description"),
  page: varchar("page", { length: 100 }),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 64 }),
  occurredAt: timestamp("occurred_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Permissions table - per-user toggleable permissions
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique(),
  // Permissions JSON: { taskName: boolean }
  // For technicians: view_equipment, add_maintenance, edit_equipment, etc.
  // For accountants: view_invoices, create_invoice, view_reports, etc.
  permissions: jsonb("permissions").notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedBy: integer("updated_by"),
});

// Installation state - tracks whether the system was installed
export const installation = pgTable("installation", {
  id: serial("id").primaryKey(),
  installed: boolean("installed").notNull().default(false),
  installedAt: timestamp("installed_at", { withTimezone: true }),
  installedBy: varchar("installed_by", { length: 100 }),
  systemName: varchar("system_name", { length: 200 })
    .notNull()
    .default("Heavy Equipment Workshop Management System"),
  // Allowed download locations (file manifests)
  fileManifest: jsonb("file_manifest"),
});

// Sessions - simple server-side session tracking for activity
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  username: varchar("username", { length: 100 }).notNull(),
  role: varchar("role", { length: 30 }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: varchar("ip_address", { length: 64 }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type LoginLog = typeof loginLogs.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type Installation = typeof installation.$inferSelect;
export type Session = typeof sessions.$inferSelect;