import { pgTable, text, serial, integer, boolean, timestamp, varchar, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("head"), // 'head', 'admin', 'root'
  phone: varchar("phone", { length: 20 }),
  gender: varchar("gender", { length: 10 }).default("male"), // 'male', 'female', 'other'
  branch: varchar("branch", { length: 100 }), // Branch field for admin users
  isProtected: boolean("is_protected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockoutUntil: timestamp("lockout_until"),
  deletedAt: timestamp("deleted_at"), // <-- soft delete
}, (table) => ({
  usernameIdx: index("users_username_idx").on(table.username),
  roleIdx: index("users_role_idx").on(table.role),
  branchIdx: index("users_branch_idx").on(table.branch),
  deletedAtIdx: index("users_deleted_at_idx").on(table.deletedAt),
}));

export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  husbandName: text("husband_name").notNull(),
  husbandID: varchar("husband_id", { length: 20 }).notNull().unique(),
  husbandBirthDate: varchar("husband_birth_date", { length: 10 }),
  husbandJob: text("husband_job"),
  // Head of household disability and chronic illness
  hasDisability: boolean("has_disability").default(false),
  disabilityType: text("disability_type"),
  hasChronicIllness: boolean("has_chronic_illness").default(false),
  chronicIllnessType: text("chronic_illness_type"),
  // Head of household war injury
  hasWarInjury: boolean("has_war_injury").default(false),
  warInjuryType: text("war_injury_type"),
  // Wife information
  wifeName: text("wife_name"),
  wifeID: varchar("wife_id", { length: 20 }),
  wifeBirthDate: varchar("wife_birth_date", { length: 10 }),
  wifeJob: text("wife_job"),
  wifePregnant: boolean("wife_pregnant").default(false),
  // Wife disability and chronic illness
  wifeHasDisability: boolean("wife_has_disability").default(false),
  wifeDisabilityType: text("wife_disability_type"),
  wifeHasChronicIllness: boolean("wife_has_chronic_illness").default(false),
  wifeChronicIllnessType: text("wife_chronic_illness_type"),
  // Wife war injury
  wifeHasWarInjury: boolean("wife_has_war_injury").default(false),
  wifeWarInjuryType: text("wife_war_injury_type"),
  primaryPhone: varchar("primary_phone", { length: 20 }),
  secondaryPhone: varchar("secondary_phone", { length: 20 }),
  originalResidence: text("original_residence"),
  currentHousing: text("current_housing"),
  isDisplaced: boolean("is_displaced").default(false),
  displacedLocation: text("displaced_location"),
  isAbroad: boolean("is_abroad").default(false),
  warDamage2023: boolean("war_damage_2023").default(false),
  warDamageDescription: text("war_damage_description"),
  branch: text("branch"),
  landmarkNear: text("landmark_near"),
  totalMembers: integer("total_members").notNull().default(0),
  numMales: integer("num_males").notNull().default(0),
  numFemales: integer("num_females").notNull().default(0),
  socialStatus: varchar("social_status", { length: 50 }),
  adminNotes: text("admin_notes"),
  priority: integer("priority").default(5), // Priority level (1-5, 5 is normal)
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Critical performance indexes
  userIdIdx: index("families_user_id_idx").on(table.userId),
  husbandIdIdx: index("families_husband_id_idx").on(table.husbandID),
  createdAtIdx: index("families_created_at_idx").on(table.createdAt),
}));

// Remove the separate wife table


export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  familyId: integer("family_id").references(() => families.id).notNull(),
  fullName: text("full_name").notNull(),
  memberID: varchar("member_id", { length: 20 }),
  birthDate: varchar("birth_date", { length: 10 }),
  gender: varchar("gender", { length: 10 }).notNull(),
  // Disability fields
  isDisabled: boolean("is_disabled").default(false),
  disabilityType: text("disability_type"),
  // Chronic illness fields
  hasChronicIllness: boolean("has_chronic_illness").default(false),
  chronicIllnessType: text("chronic_illness_type"),
  // War injury fields
  hasWarInjury: boolean("has_war_injury").default(false),
  warInjuryType: text("war_injury_type"),
  relationship: varchar("relationship", { length: 50 }).notNull(), // 'son', 'daughter', 'mother', 'other'
  isChild: boolean("is_child").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  familyIdIdx: index("members_family_id_idx").on(table.familyId),
  genderIdx: index("members_gender_idx").on(table.gender),
  relationshipIdx: index("members_relationship_idx").on(table.relationship),
}));

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  familyId: integer("family_id").references(() => families.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'financial', 'medical', 'damage'
  description: text("description").notNull(),
  attachments: text("attachments").array(),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'approved', 'rejected'
  adminComment: text("admin_comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  familyIdIdx: index("requests_family_id_idx").on(table.familyId),
  statusIdx: index("requests_status_idx").on(table.status),
  typeIdx: index("requests_type_idx").on(table.type),
  createdAtIdx: index("requests_created_at_idx").on(table.createdAt),
}));

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  target: varchar("target", { length: 20 }).default("all"), // 'all', 'head', 'specific'
  recipients: integer("recipients").array(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  readIdx: index("notifications_read_idx").on(table.read),
}));

export const orphans = pgTable("orphans", {
  id: serial("id").primaryKey(),
  familyId: integer("family_id").references(() => families.id).notNull(),
  orphanName: text("orphan_name").notNull(),
  orphanBirthDate: varchar("orphan_birth_date", { length: 10 }).notNull(),
  orphanID: varchar("orphan_id", { length: 20 }).notNull(),
  gender: varchar("gender", { length: 10 }).default("male"), // 'male', 'female'
  guardianName: text("guardian_name").notNull(),
  guardianID: varchar("guardian_id", { length: 20 }).notNull(),
  guardianBirthDate: varchar("guardian_birth_date", { length: 10 }).notNull(),
  fatherName: text("father_name").notNull(),
  fatherID: varchar("father_id", { length: 20 }).notNull(),
  martyrdomDate: varchar("martyrdom_date", { length: 10 }).notNull(),
  martyrdomType: varchar("martyrdom_type", { length: 50 }).notNull(), // New field for martyrdom type
  // Orphan disability and chronic illness fields
  hasChronicIllness: boolean("has_chronic_illness").default(false),
  chronicIllnessType: text("chronic_illness_type"),
  isDisabled: boolean("is_disabled").default(false),
  disabilityType: text("disability_type"),
  // Orphan war injury fields
  hasWarInjury: boolean("has_war_injury").default(false),
  warInjuryType: text("war_injury_type"),
  bankAccountNumber: text("bank_account_number").notNull(),
  accountHolderName: text("account_holder_name").notNull(),
  currentAddress: text("current_address").notNull(),
  originalAddress: text("original_address").notNull(),
  mobileNumber: varchar("mobile_number", { length: 20 }).notNull(),
  backupMobileNumber: varchar("backup_mobile_number", { length: 20 }).notNull(),
  image: text("image"), // Image field for orphan photos
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  familyIdIdx: index("orphans_family_id_idx").on(table.familyId),
  orphanIdIdx: index("orphans_orphan_id_idx").on(table.orphanID),
  guardianIdIdx: index("orphans_guardian_id_idx").on(table.guardianID),
  createdAtIdx: index("orphans_created_at_idx").on(table.createdAt),
}));

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  familyId: integer("family_id").references(() => families.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const sessions = pgTable("session", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: text("sess").notNull(), // JSON string
  expire: timestamp("expire", { mode: "date" }).notNull(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // e.g., 'admin', 'system', 'auth', etc.
  message: text("message").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  typeIdx: index("logs_type_idx").on(table.type),
  userIdIdx: index("logs_user_id_idx").on(table.userId),
  createdAtIdx: index("logs_created_at_idx").on(table.createdAt),
  typeUserCreatedAtIdx: index("logs_type_user_id_created_at_idx").on(table.type, table.userId, table.createdAt),
}));

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportVouchers = pgTable("support_vouchers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  supportType: varchar("support_type", { length: 50 }).notNull(), // 'food_basket', 'cash_support', 'school_kit', 'medical', 'other'
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  location: text("location"),
  isActive: boolean("is_active").default(true),
});

export const voucherRecipients = pgTable("voucher_recipients", {
  id: serial("id").primaryKey(),
  voucherId: integer("voucher_id").references(() => supportVouchers.id).notNull(),
  familyId: integer("family_id").references(() => families.id).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'received', 'paid', 'not_attended'
  notified: boolean("notified").default(false),
  notifiedAt: timestamp("notified_at"),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  notes: text("notes"),
}, (table) => ({
  voucherIdIdx: index("voucher_recipients_voucher_id_idx").on(table.voucherId),
  familyIdIdx: index("voucher_recipients_family_id_idx").on(table.familyId),
  statusIdx: index("voucher_recipients_status_idx").on(table.status),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  family: one(families, {
    fields: [users.id],
    references: [families.userId],
  }),
  createdVouchers: many(supportVouchers, { relationName: "voucherCreator" }),
  updatedRecipients: many(voucherRecipients, { relationName: "recipientUpdater" }),
}));

export const membersRelations = relations(members, ({ one }) => ({
  family: one(families, {
    fields: [members.familyId],
    references: [families.id],
  }),
}));

export const requestsRelations = relations(requests, ({ one }) => ({
  family: one(families, {
    fields: [requests.familyId],
    references: [families.id],
  }),
}));

export const orphansRelations = relations(orphans, ({ one }) => ({
  family: one(families, {
    fields: [orphans.familyId],
    references: [families.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  family: one(families, {
    fields: [documents.familyId],
    references: [families.id],
  }),
}));

export const supportVouchersRelations = relations(supportVouchers, ({ one, many }) => ({
  creator: one(users, {
    fields: [supportVouchers.createdBy],
    references: [users.id],
    relationName: "voucherCreator",
  }),
  recipients: many(voucherRecipients),
}));

export const voucherRecipientsRelations = relations(voucherRecipients, ({ one }) => ({
  voucher: one(supportVouchers, {
    fields: [voucherRecipients.voucherId],
    references: [supportVouchers.id],
  }),
  family: one(families, {
    fields: [voucherRecipients.familyId],
    references: [families.id],
  }),
  updater: one(users, {
    fields: [voucherRecipients.updatedBy],
    references: [users.id],
    relationName: "recipientUpdater",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  gender: z.enum(['male', 'female']).optional(),
  branch: z.string().optional(),
});

export const insertFamilySchema = createInsertSchema(families).omit({
  id: true,
  createdAt: true,
}).extend({
  branch: z.string().optional(),
  priority: z.number().min(1).max(5).default(5), // Priority level (1-5, 5 is normal)
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
}).extend({
  memberID: z.string().regex(/^\d{9}$/, "رقم الهوية يجب أن يكون 9 أرقام").min(1, "رقم الهوية مطلوب"),
});

export const insertOrphanSchema = createInsertSchema(orphans).omit({
  id: true,
  createdAt: true,
}).extend({
  orphanID: z.string().regex(/^\d{9}$/, "رقم هوية اليتيم يجب أن يكون 9 أرقام"),
  guardianID: z.string().regex(/^\d{9}$/, "رقم هوية الوصي يجب أن يكون 9 أرقام"),
  fatherID: z.string().regex(/^\d{9}$/, "رقم هوية الاب يجب أن يكون 9 أرقام"),
  mobileNumber: z.string().regex(/^\d{10}$/, "رقم الجوال يجب أن يكون 10 أرقام"),
  backupMobileNumber: z.string().regex(/^\d{10}$/, "رقم الجوال الاحتياطي يجب أن يكون 10 أرقام"),
  gender: z.enum(['male', 'female']).optional(),
  martyrdomType: z.enum(['war_2023', 'pre_2023_war', 'natural_death'], {
    required_error: "حالة الوفاة مطلوبة",
    invalid_type_error: "حالة الوفاة غير صحيحة"
  }),
  // Add validation for new fields
  hasChronicIllness: z.boolean().optional(),
  isDisabled: z.boolean().optional(),
  hasWarInjury: z.boolean().optional(),
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  createdAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertSupportVoucherSchema = createInsertSchema(supportVouchers).omit({
  id: true,
  createdAt: true,
});

export const insertVoucherRecipientSchema = createInsertSchema(voucherRecipients).omit({
  id: true,
  updatedAt: true,
});

// Import sessions table for tracking bulk import operations
export const importSessions = pgTable("import_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalRecords: integer("total_records").notNull(),
  validRecords: integer("valid_records").notNull(),
  invalidRecords: integer("invalid_records").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  originalFilename: varchar("original_filename", { length: 500 }),
  processed: integer("processed").default(0),
  status: varchar("status", { length: 50 }).default("initialized"), // 'initialized', 'in-progress', 'completed', 'failed'
  transformedData: text("transformed_data"), // JSON string of the valid data to import
  invalidRows: text("invalid_rows"), // JSON string of validation errors
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("import_sessions_session_id_idx").on(table.sessionId),
  userIdIdx: index("import_sessions_user_id_idx").on(table.userId),
  statusIdx: index("import_sessions_status_idx").on(table.status),
}));

export const insertSessionSchema = createInsertSchema(sessions);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type Family = typeof families.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;
export type InsertOrphan = z.infer<typeof insertOrphanSchema>;
export type Orphan = typeof orphans.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof requests.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSupportVoucher = z.infer<typeof insertSupportVoucherSchema>;
export type SupportVoucher = typeof supportVouchers.$inferSelect;
export type InsertVoucherRecipient = z.infer<typeof insertVoucherRecipientSchema>;
export type VoucherRecipient = typeof voucherRecipients.$inferSelect;
// Create a specific insert schema for import sessions
export const insertImportSessionSchema = createInsertSchema(importSessions, {
  transformedData: z.string().optional(),  // JSON string
  invalidRows: z.string().optional(),      // JSON string
  status: z.string().default("initialized")
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertImportSession = z.infer<typeof insertImportSessionSchema>;
export type ImportSession = typeof importSessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

