import { decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "citizen", "officer", "higher_authority", "admin"]).default("citizen").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, table => ({ emailIdx: index("users_email_idx").on(table.email), roleIdx: index("users_role_idx").on(table.role) }));

export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  code: varchar("code", { length: 48 }).notNull().unique(),
  description: text("description"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const authorities = mysqlTable("authorities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  departmentId: int("departmentId").references(() => departments.id),
  level: mysqlEnum("level", ["officer", "department_head", "higher_authority", "admin"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ userIdx: index("authorities_user_idx").on(table.userId), departmentIdx: index("authorities_department_idx").on(table.departmentId) }));

export const issueCategories = mysqlTable("issue_categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 140 }).notNull(),
  icon: varchar("icon", { length: 60 }),
  defaultDepartmentId: int("defaultDepartmentId").references(() => departments.id),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const complaints = mysqlTable("complaints", {
  id: int("id").autoincrement().primaryKey(),
  publicId: varchar("publicId", { length: 32 }).notNull().unique(),
  citizenId: int("citizenId").references(() => users.id),
  categoryId: int("categoryId").notNull().references(() => issueCategories.id),
  departmentId: int("departmentId").references(() => departments.id),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  priority: mysqlEnum("priority", ["Low", "Medium", "High", "Critical"]).default("Medium").notNull(),
  status: mysqlEnum("status", ["Submitted", "Verified", "Assigned", "In Progress", "Resolved", "Citizen Confirmation", "Closed", "Escalated"]).default("Submitted").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  address: varchar("address", { length: 240 }),
  area: varchar("area", { length: 160 }),
  noticedAt: timestamp("noticedAt"),
  isDangerous: int("isDangerous").default(0).notNull(),
  isAtRisk: int("isAtRisk").default(0).notNull(),
  slaDeadline: timestamp("slaDeadline"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ publicIdIdx: index("complaints_public_id_idx").on(table.publicId), statusIdx: index("complaints_status_idx").on(table.status), categoryIdx: index("complaints_category_idx").on(table.categoryId), departmentIdx: index("complaints_department_idx").on(table.departmentId), deadlineIdx: index("complaints_deadline_idx").on(table.slaDeadline), citizenIdx: index("complaints_citizen_idx").on(table.citizenId) }));

export const complaintMedia = mysqlTable("complaint_media", {
  id: int("id").autoincrement().primaryKey(),
  complaintId: int("complaintId").notNull().references(() => complaints.id),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  mediaType: mysqlEnum("mediaType", ["image", "video", "document"]).notNull(),
  originalName: varchar("originalName", { length: 240 }),
  contentType: varchar("contentType", { length: 120 }),
  isPrivate: int("isPrivate").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ complaintIdx: index("complaint_media_complaint_idx").on(table.complaintId) }));

export const complaintLocations = mysqlTable("complaint_locations", {
  id: int("id").autoincrement().primaryKey(),
  complaintId: int("complaintId").notNull().references(() => complaints.id),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  readableAddress: varchar("readableAddress", { length: 240 }),
  source: mysqlEnum("source", ["device", "search", "map", "manual"]).default("manual").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ complaintIdx: index("complaint_locations_complaint_idx").on(table.complaintId) }));

export const complaintStatusHistory = mysqlTable("complaint_status_history", {
  id: int("id").autoincrement().primaryKey(),
  complaintId: int("complaintId").notNull().references(() => complaints.id),
  status: mysqlEnum("status", ["Submitted", "Verified", "Assigned", "In Progress", "Resolved", "Citizen Confirmation", "Closed", "Escalated"]).notNull(),
  departmentId: int("departmentId").references(() => departments.id),
  actorUserId: int("actorUserId").references(() => users.id),
  action: varchar("action", { length: 240 }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ complaintIdx: index("status_history_complaint_idx").on(table.complaintId), createdIdx: index("status_history_created_idx").on(table.createdAt) }));

export const complaintAssignments = mysqlTable("complaint_assignments", {
  id: int("id").autoincrement().primaryKey(),
  complaintId: int("complaintId").notNull().references(() => complaints.id),
  departmentId: int("departmentId").notNull().references(() => departments.id),
  officerId: int("officerId").references(() => users.id),
  assignedById: int("assignedById").references(() => users.id),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
  unassignedAt: timestamp("unassignedAt"),
}, table => ({ complaintIdx: index("assignments_complaint_idx").on(table.complaintId), officerIdx: index("assignments_officer_idx").on(table.officerId) }));

export const complaintComments = mysqlTable("complaint_comments", {
  id: int("id").autoincrement().primaryKey(),
  complaintId: int("complaintId").notNull().references(() => complaints.id),
  authorId: int("authorId").references(() => users.id),
  body: text("body").notNull(),
  isInternal: int("isInternal").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ complaintIdx: index("comments_complaint_idx").on(table.complaintId) }));

export const slaRules = mysqlTable("sla_rules", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").references(() => issueCategories.id),
  priority: mysqlEnum("priority", ["Low", "Medium", "High", "Critical"]).notNull(),
  resolutionHours: int("resolutionHours").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ lookupIdx: index("sla_rules_lookup_idx").on(table.categoryId, table.priority) }));

export const escalationRules = mysqlTable("escalation_rules", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").references(() => issueCategories.id),
  fromAuthority: varchar("fromAuthority", { length: 120 }).notNull(),
  toAuthority: varchar("toAuthority", { length: 120 }).notNull(),
  escalationHours: int("escalationHours").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const escalations = mysqlTable("escalations", {
  id: int("id").autoincrement().primaryKey(),
  complaintId: int("complaintId").notNull().references(() => complaints.id),
  ruleId: int("ruleId").references(() => escalationRules.id),
  fromAuthority: varchar("fromAuthority", { length: 120 }).notNull(),
  toAuthority: varchar("toAuthority", { length: 120 }).notNull(),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["Open", "Acknowledged", "Resolved"]).default("Open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
}, table => ({ complaintIdx: index("escalations_complaint_idx").on(table.complaintId), statusIdx: index("escalations_status_idx").on(table.status) }));

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  complaintId: int("complaintId").references(() => complaints.id),
  kind: varchar("kind", { length: 80 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ userIdx: index("notifications_user_idx").on(table.userId), createdIdx: index("notifications_created_idx").on(table.createdAt) }));

export const safetyReports = mysqlTable("safety_reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterId: int("reporterId").references(() => users.id),
  type: varchar("type", { length: 120 }).notNull(),
  location: varchar("location", { length: 240 }).notNull(),
  description: text("description").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  isAnonymous: int("isAnonymous").default(1).notNull(),
  visibility: mysqlEnum("visibility", ["private", "reviewers", "public_aggregate"]).default("private").notNull(),
  status: mysqlEnum("status", ["Received", "Reviewing", "Resolved", "Closed"]).default("Received").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ statusIdx: index("safety_reports_status_idx").on(table.status), locationIdx: index("safety_reports_location_idx").on(table.location) }));

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorUserId: int("actorUserId").references(() => users.id),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: varchar("entityId", { length: 80 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ actorIdx: index("audit_actor_idx").on(table.actorUserId), createdIdx: index("audit_created_idx").on(table.createdAt) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
