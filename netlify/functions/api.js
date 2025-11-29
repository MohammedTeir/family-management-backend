var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/schema.ts
var schema_exports = {};
__export(schema_exports, {
  documents: () => documents,
  documentsRelations: () => documentsRelations,
  families: () => families2,
  insertDocumentSchema: () => insertDocumentSchema,
  insertFamilySchema: () => insertFamilySchema,
  insertLogSchema: () => insertLogSchema,
  insertMemberSchema: () => insertMemberSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOrphanSchema: () => insertOrphanSchema,
  insertRequestSchema: () => insertRequestSchema,
  insertSessionSchema: () => insertSessionSchema,
  insertSettingsSchema: () => insertSettingsSchema,
  insertSupportVoucherSchema: () => insertSupportVoucherSchema,
  insertUserSchema: () => insertUserSchema,
  insertVoucherRecipientSchema: () => insertVoucherRecipientSchema,
  logs: () => logs,
  members: () => members,
  membersRelations: () => membersRelations,
  notifications: () => notifications,
  orphans: () => orphans,
  orphansRelations: () => orphansRelations,
  requests: () => requests,
  requestsRelations: () => requestsRelations,
  sessions: () => sessions,
  settings: () => settings,
  supportVouchers: () => supportVouchers,
  supportVouchersRelations: () => supportVouchersRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  voucherRecipients: () => voucherRecipients,
  voucherRecipientsRelations: () => voucherRecipientsRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var users, families2, members, requests, notifications, orphans, documents, sessions, logs, settings, supportVouchers, voucherRecipients, usersRelations, membersRelations, requestsRelations, orphansRelations, documentsRelations, supportVouchersRelations, voucherRecipientsRelations, insertUserSchema, insertFamilySchema, insertMemberSchema, insertOrphanSchema, insertRequestSchema, insertNotificationSchema, insertDocumentSchema, insertLogSchema, insertSettingsSchema, insertSupportVoucherSchema, insertVoucherRecipientSchema, insertSessionSchema;
var init_schema = __esm({
  "src/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: varchar("username", { length: 255 }).notNull().unique(),
      password: text("password").notNull(),
      role: varchar("role", { length: 20 }).notNull().default("head"),
      // 'head', 'admin', 'root'
      phone: varchar("phone", { length: 20 }),
      gender: varchar("gender", { length: 10 }).default("male"),
      // 'male', 'female', 'other'
      isProtected: boolean("is_protected").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
      lockoutUntil: timestamp("lockout_until"),
      deletedAt: timestamp("deleted_at")
      // <-- soft delete
    }, (table) => ({
      usernameIdx: index("users_username_idx").on(table.username),
      roleIdx: index("users_role_idx").on(table.role),
      deletedAtIdx: index("users_deleted_at_idx").on(table.deletedAt)
    }));
    families2 = pgTable("families", {
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
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => ({
      // Critical performance indexes
      userIdIdx: index("families_user_id_idx").on(table.userId),
      husbandIdIdx: index("families_husband_id_idx").on(table.husbandID),
      createdAtIdx: index("families_created_at_idx").on(table.createdAt)
    }));
    members = pgTable("members", {
      id: serial("id").primaryKey(),
      familyId: integer("family_id").references(() => families2.id).notNull(),
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
      relationship: varchar("relationship", { length: 50 }).notNull(),
      // 'son', 'daughter', 'mother', 'other'
      isChild: boolean("is_child").default(true),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => ({
      familyIdIdx: index("members_family_id_idx").on(table.familyId),
      genderIdx: index("members_gender_idx").on(table.gender),
      relationshipIdx: index("members_relationship_idx").on(table.relationship)
    }));
    requests = pgTable("requests", {
      id: serial("id").primaryKey(),
      familyId: integer("family_id").references(() => families2.id).notNull(),
      type: varchar("type", { length: 50 }).notNull(),
      // 'financial', 'medical', 'damage'
      description: text("description").notNull(),
      attachments: text("attachments").array(),
      status: varchar("status", { length: 20 }).default("pending"),
      // 'pending', 'approved', 'rejected'
      adminComment: text("admin_comment"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      familyIdIdx: index("requests_family_id_idx").on(table.familyId),
      statusIdx: index("requests_status_idx").on(table.status),
      typeIdx: index("requests_type_idx").on(table.type),
      createdAtIdx: index("requests_created_at_idx").on(table.createdAt)
    }));
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      target: varchar("target", { length: 20 }).default("all"),
      // 'all', 'head', 'specific'
      recipients: integer("recipients").array(),
      createdAt: timestamp("created_at").defaultNow()
    });
    orphans = pgTable("orphans", {
      id: serial("id").primaryKey(),
      familyId: integer("family_id").references(() => families2.id).notNull(),
      orphanName: text("orphan_name").notNull(),
      orphanBirthDate: varchar("orphan_birth_date", { length: 10 }).notNull(),
      orphanID: varchar("orphan_id", { length: 20 }).notNull(),
      gender: varchar("gender", { length: 10 }).default("male"),
      // 'male', 'female'
      guardianName: text("guardian_name").notNull(),
      guardianID: varchar("guardian_id", { length: 20 }).notNull(),
      guardianBirthDate: varchar("guardian_birth_date", { length: 10 }).notNull(),
      fatherName: text("father_name").notNull(),
      fatherID: varchar("father_id", { length: 20 }).notNull(),
      martyrdomDate: varchar("martyrdom_date", { length: 10 }).notNull(),
      martyrdomType: varchar("martyrdom_type", { length: 50 }).notNull(),
      // New field for martyrdom type
      bankAccountNumber: text("bank_account_number").notNull(),
      accountHolderName: text("account_holder_name").notNull(),
      currentAddress: text("current_address").notNull(),
      originalAddress: text("original_address").notNull(),
      mobileNumber: varchar("mobile_number", { length: 20 }).notNull(),
      backupMobileNumber: varchar("backup_mobile_number", { length: 20 }).notNull(),
      image: text("image"),
      // Image field for orphan photos
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => ({
      familyIdIdx: index("orphans_family_id_idx").on(table.familyId),
      orphanIdIdx: index("orphans_orphan_id_idx").on(table.orphanID),
      guardianIdIdx: index("orphans_guardian_id_idx").on(table.guardianID),
      createdAtIdx: index("orphans_created_at_idx").on(table.createdAt)
    }));
    documents = pgTable("documents", {
      id: serial("id").primaryKey(),
      familyId: integer("family_id").references(() => families2.id).notNull(),
      filename: text("filename").notNull(),
      originalName: text("original_name").notNull(),
      fileSize: integer("file_size"),
      mimeType: varchar("mime_type", { length: 100 }),
      uploadedAt: timestamp("uploaded_at").defaultNow()
    });
    sessions = pgTable("session", {
      sid: varchar("sid", { length: 255 }).primaryKey(),
      sess: text("sess").notNull(),
      // JSON string
      expire: timestamp("expire", { mode: "date" }).notNull()
    });
    logs = pgTable("logs", {
      id: serial("id").primaryKey(),
      type: varchar("type", { length: 50 }).notNull(),
      // e.g., 'admin', 'system', 'auth', etc.
      message: text("message").notNull(),
      userId: integer("user_id").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    settings = pgTable("settings", {
      id: serial("id").primaryKey(),
      key: varchar("key", { length: 100 }).notNull().unique(),
      value: text("value").notNull(),
      description: text("description"),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    supportVouchers = pgTable("support_vouchers", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      supportType: varchar("support_type", { length: 50 }).notNull(),
      // 'food_basket', 'cash_support', 'school_kit', 'medical', 'other'
      createdBy: integer("created_by").references(() => users.id).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      location: text("location"),
      isActive: boolean("is_active").default(true)
    });
    voucherRecipients = pgTable("voucher_recipients", {
      id: serial("id").primaryKey(),
      voucherId: integer("voucher_id").references(() => supportVouchers.id).notNull(),
      familyId: integer("family_id").references(() => families2.id).notNull(),
      status: varchar("status", { length: 20 }).default("pending"),
      // 'pending', 'received', 'paid', 'not_attended'
      notified: boolean("notified").default(false),
      notifiedAt: timestamp("notified_at"),
      updatedBy: integer("updated_by").references(() => users.id),
      updatedAt: timestamp("updated_at").defaultNow(),
      notes: text("notes")
    }, (table) => ({
      voucherIdIdx: index("voucher_recipients_voucher_id_idx").on(table.voucherId),
      familyIdIdx: index("voucher_recipients_family_id_idx").on(table.familyId),
      statusIdx: index("voucher_recipients_status_idx").on(table.status)
    }));
    usersRelations = relations(users, ({ one, many }) => ({
      family: one(families2, {
        fields: [users.id],
        references: [families2.userId]
      }),
      createdVouchers: many(supportVouchers, { relationName: "voucherCreator" }),
      updatedRecipients: many(voucherRecipients, { relationName: "recipientUpdater" })
    }));
    membersRelations = relations(members, ({ one }) => ({
      family: one(families2, {
        fields: [members.familyId],
        references: [families2.id]
      })
    }));
    requestsRelations = relations(requests, ({ one }) => ({
      family: one(families2, {
        fields: [requests.familyId],
        references: [families2.id]
      })
    }));
    orphansRelations = relations(orphans, ({ one }) => ({
      family: one(families2, {
        fields: [orphans.familyId],
        references: [families2.id]
      })
    }));
    documentsRelations = relations(documents, ({ one }) => ({
      family: one(families2, {
        fields: [documents.familyId],
        references: [families2.id]
      })
    }));
    supportVouchersRelations = relations(supportVouchers, ({ one, many }) => ({
      creator: one(users, {
        fields: [supportVouchers.createdBy],
        references: [users.id],
        relationName: "voucherCreator"
      }),
      recipients: many(voucherRecipients)
    }));
    voucherRecipientsRelations = relations(voucherRecipients, ({ one }) => ({
      voucher: one(supportVouchers, {
        fields: [voucherRecipients.voucherId],
        references: [supportVouchers.id]
      }),
      family: one(families2, {
        fields: [voucherRecipients.familyId],
        references: [families2.id]
      }),
      updater: one(users, {
        fields: [voucherRecipients.updatedBy],
        references: [users.id],
        relationName: "recipientUpdater"
      })
    }));
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true
    }).extend({
      gender: z.enum(["male", "female"]).optional()
    });
    insertFamilySchema = createInsertSchema(families2).omit({
      id: true,
      createdAt: true
    });
    insertMemberSchema = createInsertSchema(members).omit({
      id: true,
      createdAt: true
    });
    insertOrphanSchema = createInsertSchema(orphans).omit({
      id: true,
      createdAt: true
    }).extend({
      orphanID: z.string().regex(/^\d{9}$/, "\u0631\u0642\u0645 \u0647\u0648\u064A\u0629 \u0627\u0644\u064A\u062A\u064A\u0645 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 9 \u0623\u0631\u0642\u0627\u0645"),
      guardianID: z.string().regex(/^\d{9}$/, "\u0631\u0642\u0645 \u0647\u0648\u064A\u0629 \u0627\u0644\u0648\u0635\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 9 \u0623\u0631\u0642\u0627\u0645"),
      fatherID: z.string().regex(/^\d{9}$/, "\u0631\u0642\u0645 \u0647\u0648\u064A\u0629 \u0627\u0644\u0627\u0628 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 9 \u0623\u0631\u0642\u0627\u0645"),
      mobileNumber: z.string().regex(/^\d{10}$/, "\u0631\u0642\u0645 \u0627\u0644\u062C\u0648\u0627\u0644 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 10 \u0623\u0631\u0642\u0627\u0645"),
      backupMobileNumber: z.string().regex(/^\d{10}$/, "\u0631\u0642\u0645 \u0627\u0644\u062C\u0648\u0627\u0644 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 10 \u0623\u0631\u0642\u0627\u0645"),
      gender: z.enum(["male", "female"]).optional(),
      martyrdomType: z.enum(["war_2023", "pre_2023_war", "natural_death"], {
        required_error: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0648\u0641\u0627\u0629 \u0645\u0637\u0644\u0648\u0628\u0629",
        invalid_type_error: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0648\u0641\u0627\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629"
      })
    });
    insertRequestSchema = createInsertSchema(requests).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true
    });
    insertDocumentSchema = createInsertSchema(documents).omit({
      id: true,
      uploadedAt: true
    });
    insertLogSchema = createInsertSchema(logs).omit({
      id: true,
      createdAt: true
    });
    insertSettingsSchema = createInsertSchema(settings).omit({
      id: true,
      updatedAt: true
    });
    insertSupportVoucherSchema = createInsertSchema(supportVouchers).omit({
      id: true,
      createdAt: true
    });
    insertVoucherRecipientSchema = createInsertSchema(voucherRecipients).omit({
      id: true,
      updatedAt: true
    });
    insertSessionSchema = createInsertSchema(sessions);
  }
});

// src/db.ts
import dotenv from "dotenv";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var Pool, pool, db;
var init_db = __esm({
  "src/db.ts"() {
    "use strict";
    init_schema();
    dotenv.config();
    ({ Pool } = pg);
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
        // ✅ Required for Neon over TCP
      }
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// src/db-retry.ts
function isConnectionError(error) {
  if (!error) return false;
  if (error.code && CONNECTION_ERROR_CODES.includes(error.code)) {
    return true;
  }
  const message = error.message?.toLowerCase() || "";
  return message.includes("connection") || message.includes("connect") || message.includes("terminating") || message.includes("timeout") || message.includes("network") || message.includes("closed");
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function withRetry(operation, maxAttempts = 3, initialDelay = 1e3) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`\u{1F504} Database operation attempt ${attempt}/${maxAttempts}`);
      const result = await operation();
      if (attempt > 1) {
        console.log(`\u2705 Database operation succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.error(`\u274C Database operation failed on attempt ${attempt}:`, {
        code: error.code,
        message: error.message,
        isConnectionError: isConnectionError(error)
      });
      if (attempt === maxAttempts || !isConnectionError(error)) {
        break;
      }
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(`\u23F3 Waiting ${delay}ms before retry...`);
      await sleep(delay);
      try {
        console.log("\u{1F504} Testing database connection...");
        await db.execute("SELECT 1");
        console.log("\u2705 Database connection is healthy");
      } catch (connectionError) {
        console.log("\u26A0\uFE0F Database connection test failed, will retry operation anyway");
      }
    }
  }
  console.error("\u{1F4A5} Database operation failed after all retries:", {
    code: lastError.code,
    message: lastError.message,
    maxAttempts,
    isConnectionError: isConnectionError(lastError)
  });
  if (isConnectionError(lastError)) {
    const enhancedError = new Error(
      `Database temporarily unavailable. Please try again in a moment. (${lastError.message})`
    );
    enhancedError.code = lastError.code;
    enhancedError.isConnectionError = true;
    throw enhancedError;
  }
  throw lastError;
}
async function checkDatabaseHealth() {
  try {
    await withRetry(() => db.execute("SELECT 1"), 2, 500);
    return { healthy: true };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      isConnectionError: isConnectionError(error)
    };
  }
}
var CONNECTION_ERROR_CODES;
var init_db_retry = __esm({
  "src/db-retry.ts"() {
    "use strict";
    init_db();
    CONNECTION_ERROR_CODES = [
      "57P01",
      // admin_shutdown
      "57P02",
      // crash_shutdown  
      "57P03",
      // cannot_connect_now
      "08000",
      // connection_exception
      "08003",
      // connection_does_not_exist
      "08006",
      // connection_failure
      "08001",
      // sqlclient_unable_to_establish_sqlconnection
      "08004"
      // sqlserver_rejected_establishment_of_sqlconnection
    ];
  }
});

// src/storage.ts
import { eq as eq2, desc, and, sql, isNull, inArray } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "src/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_db_retry();
    DatabaseStorage = class {
      // Settings cache to avoid repeated database queries
      settingsCache = /* @__PURE__ */ new Map();
      settingsCacheExpiry = 0;
      CACHE_TTL = 5 * 60 * 1e3;
      // 5 minutes
      constructor() {
      }
      // Users
      async getUser(id, opts) {
        const whereClause = opts?.includeDeleted ? eq2(users.id, id) : and(eq2(users.id, id), isNull(users.deletedAt));
        const [user] = await db.select().from(users).where(whereClause);
        return user || void 0;
      }
      async getUserByUsername(username) {
        const [user] = await withRetry(
          () => db.select().from(users).where(and(eq2(users.username, username), isNull(users.deletedAt)))
        );
        return user || void 0;
      }
      async getUserByNationalId(nationalId) {
        const [family] = await db.select({ user: users }).from(families2).innerJoin(users, and(eq2(families2.userId, users.id), isNull(users.deletedAt))).where(eq2(families2.husbandID, nationalId));
        return family?.user || void 0;
      }
      async createUser(insertUser) {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async updateUser(id, user) {
        const [updatedUser] = await db.update(users).set(user).where(eq2(users.id, id)).returning();
        return updatedUser || void 0;
      }
      async deleteUser(id) {
        await db.update(logs).set({ userId: null }).where(eq2(logs.userId, id));
        await db.update(voucherRecipients).set({ updatedBy: null }).where(eq2(voucherRecipients.updatedBy, id));
        await db.update(supportVouchers).set({ createdBy: 1 }).where(eq2(supportVouchers.createdBy, id));
        const result = await db.delete(users).where(eq2(users.id, id));
        return (result?.rowCount ?? 0) > 0;
      }
      async getAllUsers(opts) {
        if (opts?.includeDeleted) {
          return await db.select().from(users);
        }
        return await db.select().from(users).where(isNull(users.deletedAt));
      }
      async softDeleteUser(id) {
        await db.update(logs).set({ userId: null }).where(eq2(logs.userId, id));
        await db.update(voucherRecipients).set({ updatedBy: null }).where(eq2(voucherRecipients.updatedBy, id));
        await db.update(supportVouchers).set({ createdBy: 1 }).where(eq2(supportVouchers.createdBy, id));
        const [user] = await db.update(users).set({ deletedAt: /* @__PURE__ */ new Date() }).where(eq2(users.id, id)).returning();
        return !!user;
      }
      async restoreUser(id) {
        const [user] = await db.update(users).set({ deletedAt: null }).where(eq2(users.id, id)).returning();
        return !!user;
      }
      // Families
      async getFamily(id) {
        const [family] = await db.select().from(families2).where(eq2(families2.id, id));
        return family || void 0;
      }
      async getFamilyByUserId(userId) {
        const [family] = await db.select().from(families2).where(eq2(families2.userId, userId));
        return family || void 0;
      }
      async createFamily(family) {
        const [createdFamily] = await db.insert(families2).values(family).returning();
        return createdFamily;
      }
      async updateFamily(id, family) {
        const [updatedFamily] = await db.update(families2).set(family).where(eq2(families2.id, id)).returning();
        return updatedFamily || void 0;
      }
      async getAllFamilies() {
        return await db.select().from(families2).orderBy(desc(families2.createdAt));
      }
      async getAllFamiliesWithMembers() {
        const allFamilies = await this.getAllFamilies();
        const familiesWithMembers = await Promise.all(
          allFamilies.map(async (family) => {
            const members2 = await this.getMembersByFamilyId(family.id);
            return { ...family, members: members2 };
          })
        );
        return familiesWithMembers;
      }
      // Optimized version using JOIN to avoid N+1 queries
      async getAllFamiliesWithMembersOptimized() {
        const allFamilies = await this.getAllFamilies();
        const allMembers = await db.select().from(members);
        const membersByFamilyId = /* @__PURE__ */ new Map();
        allMembers.forEach((member) => {
          if (!membersByFamilyId.has(member.familyId)) {
            membersByFamilyId.set(member.familyId, []);
          }
          membersByFamilyId.get(member.familyId).push(member);
        });
        const familiesWithMembers = allFamilies.map((family) => ({
          ...family,
          members: membersByFamilyId.get(family.id) || []
        }));
        return familiesWithMembers;
      }
      async deleteFamily(id) {
        await db.delete(members).where(eq2(members.familyId, id));
        await db.delete(orphans).where(eq2(orphans.familyId, id));
        await db.delete(requests).where(eq2(requests.familyId, id));
        await db.delete(documents).where(eq2(documents.familyId, id));
        await db.delete(voucherRecipients).where(eq2(voucherRecipients.familyId, id));
        const result = await db.delete(families2).where(eq2(families2.id, id));
        return (result?.rowCount ?? 0) > 0;
      }
      async getFamiliesByUserId(userId) {
        return await db.select().from(families2).where(eq2(families2.userId, userId));
      }
      // Wife is now part of families table - retrieve from family data
      async getWifeByFamilyId(familyId) {
        const family = await this.getFamily(familyId);
        if (!family) return void 0;
        return {
          id: family.id,
          // Use family ID as the identifier for the wife data
          familyId: family.id,
          wifeName: family.wifeName,
          wifeID: family.wifeID,
          wifeBirthDate: family.wifeBirthDate,
          wifeJob: family.wifeJob,
          wifePregnant: family.wifePregnant,
          wifeHasDisability: family.wifeHasDisability,
          wifeDisabilityType: family.wifeDisabilityType,
          wifeHasChronicIllness: family.wifeHasChronicIllness,
          wifeChronicIllnessType: family.wifeChronicIllnessType,
          createdAt: family.createdAt
          // Using family's created at as reference
        };
      }
      async getWife(id) {
        return void 0;
      }
      async createWife(wife) {
        if (!wife.familyId) throw new Error("Family ID is required to add wife data");
        const [updatedFamily] = await db.update(families2).set({
          wifeName: wife.wifeName,
          wifeID: wife.wifeID,
          wifeBirthDate: wife.wifeBirthDate,
          wifeJob: wife.wifeJob,
          wifePregnant: wife.wifePregnant,
          wifeHasDisability: wife.wifeHasDisability,
          wifeDisabilityType: wife.wifeDisabilityType,
          wifeHasChronicIllness: wife.wifeHasChronicIllness,
          wifeChronicIllnessType: wife.wifeChronicIllnessType
        }).where(eq2(families2.id, wife.familyId)).returning();
        return updatedFamily;
      }
      async updateWife(id, wife) {
        const family = await this.getFamily(id);
        if (!family) return void 0;
        const [updatedFamily] = await db.update(families2).set({
          wifeName: wife.wifeName,
          wifeID: wife.wifeID,
          wifeBirthDate: wife.wifeBirthDate,
          wifeJob: wife.wifeJob,
          wifePregnant: wife.wifePregnant,
          wifeHasDisability: wife.wifeHasDisability,
          wifeDisabilityType: wife.wifeDisabilityType,
          wifeHasChronicIllness: wife.wifeChronicIllness,
          wifeChronicIllnessType: wife.wifeChronicIllnessType
        }).where(eq2(families2.id, id)).returning();
        return updatedFamily;
      }
      async deleteWife(id) {
        const [family] = await db.select().from(families2).where(
          and(
            eq2(families2.id, id),
            isNull(families2.wifeName).neg()
            // Check if wifeName exists
          )
        );
        if (!family) return false;
        const result = await db.update(families2).set({
          wifeName: null,
          wifeID: null,
          wifeBirthDate: null,
          wifeJob: null,
          wifePregnant: false
        }).where(eq2(families2.id, id));
        return (result?.rowCount ?? 0) > 0;
      }
      // Members
      async getMembersByFamilyId(familyId) {
        return await db.select().from(members).where(eq2(members.familyId, familyId));
      }
      async getMember(id) {
        const [member] = await db.select().from(members).where(eq2(members.id, id));
        return member || void 0;
      }
      async createMember(member) {
        const [createdMember] = await db.insert(members).values(member).returning();
        return createdMember;
      }
      async updateMember(id, member) {
        const [updatedMember] = await db.update(members).set(member).where(eq2(members.id, id)).returning();
        return updatedMember || void 0;
      }
      async deleteMember(id) {
        const result = await db.delete(members).where(eq2(members.id, id));
        return (result?.rowCount ?? 0) > 0;
      }
      // Orphans
      async getOrphansByFamilyId(familyId) {
        return await db.select().from(orphans).where(eq2(orphans.familyId, familyId));
      }
      async getAllOrphans() {
        return await db.select().from(orphans);
      }
      async getOrphansCountUnder18ByFamilyId(familyId) {
        const result = await db.select({ count: sql`count(*)` }).from(orphans).where(
          and(
            eq2(orphans.familyId, familyId),
            sql`(CAST(${orphans.orphanBirthDate} AS DATE) > (CURRENT_DATE - INTERVAL '18 years'))`
          )
        );
        return result[0]?.count || 0;
      }
      async getOrphan(id) {
        const [orphan] = await db.select().from(orphans).where(eq2(orphans.id, id));
        return orphan || void 0;
      }
      async createOrphan(orphan) {
        const [createdOrphan] = await db.insert(orphans).values(orphan).returning();
        return createdOrphan;
      }
      async updateOrphan(id, orphan) {
        const [updatedOrphan] = await db.update(orphans).set(orphan).where(eq2(orphans.id, id)).returning();
        return updatedOrphan || void 0;
      }
      async deleteOrphan(id) {
        const result = await db.delete(orphans).where(eq2(orphans.id, id));
        return (result?.rowCount ?? 0) > 0;
      }
      // Requests
      async getRequestsByFamilyId(familyId) {
        return await db.select().from(requests).where(eq2(requests.familyId, familyId)).orderBy(desc(requests.createdAt));
      }
      async getAllRequests() {
        return await db.select().from(requests).orderBy(desc(requests.createdAt));
      }
      // Optimized version to avoid N+1 queries for requests with families
      async getAllRequestsWithFamilies() {
        const allRequests = await this.getAllRequests();
        const allFamilies = await this.getAllFamilies();
        const familyMap = /* @__PURE__ */ new Map();
        allFamilies.forEach((family) => {
          familyMap.set(family.id, family);
        });
        const requestsWithFamilies = allRequests.map((request) => ({
          ...request,
          family: familyMap.get(request.familyId)
        }));
        return requestsWithFamilies;
      }
      async getRequest(id) {
        const [request] = await db.select().from(requests).where(eq2(requests.id, id));
        return request || void 0;
      }
      async createRequest(request) {
        const [createdRequest] = await db.insert(requests).values(request).returning();
        return createdRequest;
      }
      async updateRequest(id, request) {
        const [updatedRequest] = await db.update(requests).set({
          ...request,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(requests.id, id)).returning();
        return updatedRequest || void 0;
      }
      // Notifications
      async getAllNotifications() {
        return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
      }
      async createNotification(notification) {
        const [createdNotification] = await db.insert(notifications).values(notification).returning();
        return createdNotification;
      }
      // Documents
      async getDocumentsByFamilyId(familyId) {
        return await db.select().from(documents).where(eq2(documents.familyId, familyId));
      }
      async createDocument(document) {
        const [createdDocument] = await db.insert(documents).values(document).returning();
        return createdDocument;
      }
      async deleteDocument(id) {
        const result = await db.delete(documents).where(eq2(documents.id, id));
        return (result?.rowCount ?? 0) > 0;
      }
      // Logs
      async getLogs(filter = {}) {
        let query = db.select().from(logs);
        if (filter.type) query = query.where(eq2(logs.type, filter.type));
        if (filter.userId) query = query.where(eq2(logs.userId, filter.userId));
        if (filter.search) query = query.where(sql`${logs.message} ILIKE '%' || ${filter.search} || '%'`);
        if (filter.startDate) query = query.where(sql`${logs.createdAt} >= ${filter.startDate}`);
        if (filter.endDate) query = query.where(sql`${logs.createdAt} <= ${filter.endDate}`);
        if (filter.limit) query = query.limit(filter.limit);
        if (filter.offset) query = query.offset(filter.offset);
        return await query.orderBy(desc(logs.createdAt));
      }
      async createLog(log) {
        const [created] = await db.insert(logs).values(log).returning();
        return created;
      }
      // Settings (with caching)
      isCacheValid() {
        return Date.now() < this.settingsCacheExpiry;
      }
      async refreshSettingsCache() {
        console.log("\u{1F504} Refreshing settings cache...");
        const allSettings = await db.select().from(settings);
        this.settingsCache.clear();
        allSettings.forEach((setting) => {
          this.settingsCache.set(setting.key, setting.value);
        });
        this.settingsCacheExpiry = Date.now() + this.CACHE_TTL;
        console.log(`\u2705 Settings cache refreshed with ${allSettings.length} settings`);
      }
      async getSetting(key) {
        if (!this.isCacheValid()) {
          await this.refreshSettingsCache();
        }
        return this.settingsCache.get(key);
      }
      async setSetting(key, value, description) {
        await db.insert(settings).values({ key, value, description }).onConflictDoUpdate({
          target: settings.key,
          set: { value, description }
        });
        this.settingsCache.set(key, value);
        console.log(`\u{1F504} Setting '${key}' updated in cache`);
      }
      async getAllSettings() {
        if (!this.isCacheValid()) {
          await this.refreshSettingsCache();
        }
        const settingsArray = [];
        for (const [key, value] of this.settingsCache.entries()) {
          const [fullSetting] = await db.select().from(settings).where(eq2(settings.key, key));
          if (fullSetting) {
            settingsArray.push(fullSetting);
          }
        }
        return settingsArray;
      }
      // Method to clear cache when settings are bulk updated
      clearSettingsCache() {
        this.settingsCache.clear();
        this.settingsCacheExpiry = 0;
        console.log("\u{1F5D1}\uFE0F Settings cache cleared");
      }
      // Support Vouchers
      async getAllSupportVouchers() {
        const vouchers = await db.select().from(supportVouchers).orderBy(desc(supportVouchers.createdAt));
        const vouchersWithDetails = await Promise.all(
          vouchers.map(async (voucher) => {
            const creator = await this.getUser(voucher.createdBy);
            const recipients = await this.getVoucherRecipients(voucher.id);
            return {
              ...voucher,
              creator,
              recipients
            };
          })
        );
        return vouchersWithDetails;
      }
      // Optimized version to avoid N+1 queries for support vouchers
      async getAllSupportVouchersOptimized() {
        const vouchers = await db.select().from(supportVouchers).orderBy(desc(supportVouchers.createdAt));
        const [allUsers, allFamilies, allRecipients] = await Promise.all([
          this.getAllUsers(),
          this.getAllFamilies(),
          db.select().from(voucherRecipients)
        ]);
        const userMap = /* @__PURE__ */ new Map();
        allUsers.forEach((user) => userMap.set(user.id, user));
        const familyMap = /* @__PURE__ */ new Map();
        allFamilies.forEach((family) => familyMap.set(family.id, family));
        const recipientsByVoucherId = /* @__PURE__ */ new Map();
        allRecipients.forEach((recipient) => {
          const family = familyMap.get(recipient.familyId);
          if (family) {
            if (!recipientsByVoucherId.has(recipient.voucherId)) {
              recipientsByVoucherId.set(recipient.voucherId, []);
            }
            recipientsByVoucherId.get(recipient.voucherId).push({ ...recipient, family });
          }
        });
        const vouchersWithDetails = vouchers.map((voucher) => ({
          ...voucher,
          creator: userMap.get(voucher.createdBy),
          recipients: recipientsByVoucherId.get(voucher.id) || []
        }));
        return vouchersWithDetails;
      }
      async getSupportVoucher(id) {
        const [supportVoucher] = await db.select().from(supportVouchers).where(eq2(supportVouchers.id, id));
        return supportVoucher || void 0;
      }
      async createSupportVoucher(voucher) {
        const [createdVoucher] = await db.insert(supportVouchers).values(voucher).returning();
        return createdVoucher;
      }
      async updateSupportVoucher(id, voucher) {
        const [updatedVoucher] = await db.update(supportVouchers).set(voucher).where(eq2(supportVouchers.id, id)).returning();
        return updatedVoucher || void 0;
      }
      // Voucher Recipients
      async getVoucherRecipients(voucherId) {
        const recipients = await db.select().from(voucherRecipients).where(eq2(voucherRecipients.voucherId, voucherId));
        const recipientsWithFamilies = await Promise.all(
          recipients.map(async (recipient) => {
            const family = await this.getFamily(recipient.familyId);
            return {
              ...recipient,
              family
            };
          })
        );
        return recipientsWithFamilies;
      }
      // Optimized version to avoid N+1 queries for voucher recipients
      async getVoucherRecipientsOptimized(voucherId) {
        const recipients = await db.select().from(voucherRecipients).where(eq2(voucherRecipients.voucherId, voucherId));
        if (recipients.length === 0) return [];
        const allFamilies = await this.getAllFamilies();
        const familyMap = /* @__PURE__ */ new Map();
        allFamilies.forEach((family) => familyMap.set(family.id, family));
        const recipientsWithFamilies = recipients.map((recipient) => ({
          ...recipient,
          family: familyMap.get(recipient.familyId)
        }));
        return recipientsWithFamilies;
      }
      async createVoucherRecipient(recipient) {
        const [createdRecipient] = await db.insert(voucherRecipients).values(recipient).returning();
        return createdRecipient;
      }
      async updateVoucherRecipient(id, recipient) {
        const [updatedRecipient] = await db.update(voucherRecipients).set(recipient).where(eq2(voucherRecipients.id, id)).returning();
        return updatedRecipient || void 0;
      }
      async clearLogs() {
        await db.delete(logs);
      }
      async clearNotifications() {
        await db.delete(notifications);
      }
      async clearRequests() {
        await db.delete(requests);
      }
      async clearMembers() {
        await db.delete(members);
      }
      async clearFamilies() {
        await db.delete(families2);
      }
      async clearUsers() {
        await db.delete(users);
      }
      async clearHeads() {
        const headUsers = await db.select({ id: users.id, username: users.username }).from(users).where(eq2(users.role, "head"));
        const headUserIds = headUsers.map((user) => user.id);
        if (headUserIds.length > 0) {
          await db.delete(families2).where(inArray(families2.userId, headUserIds));
          await db.delete(users).where(inArray(users.id, headUserIds));
        }
      }
      async clearWives() {
        const result = await db.update(families2).set({
          wifeName: null,
          wifeID: null,
          wifeBirthDate: null,
          wifeJob: null,
          wifePregnant: false
        });
        return (result?.rowCount ?? 0) > 0;
      }
      async clearSettings() {
        await db.delete(settings);
      }
    };
    storage = new DatabaseStorage();
  }
});

// src/auth.ts
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import bcrypt from "bcryptjs";
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  if (!stored) {
    console.log(`\u274C No stored password`);
    return false;
  }
  if (stored.startsWith("$2") && stored.length >= 60) {
    console.log(`\u{1F510} Using bcrypt comparison for: ${stored.substring(0, 10)}...`);
    try {
      const result = await bcrypt.compare(supplied, stored);
      console.log(`\u{1F512} Bcrypt comparison result: ${result}`);
      return result;
    } catch (error) {
      console.error("Bcrypt comparison error:", error);
      return false;
    }
  }
  if (stored.includes(".")) {
    console.log(`\u{1F510} Using scrypt comparison for: ${stored.substring(0, 20)}...`);
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.log(`\u274C Failed to split scrypt hash: hashed=${!!hashed}, salt=${!!salt}`);
      return false;
    }
    try {
      const hashedBuf = Buffer.from(hashed, "hex");
      const suppliedBuf = await scryptAsync(supplied, salt, 64);
      console.log(`\u{1F50D} Buffer lengths - stored: ${hashedBuf.length}, computed: ${suppliedBuf.length}`);
      if (hashedBuf.length !== suppliedBuf.length) {
        console.log(`\u274C Buffer length mismatch`);
        return false;
      }
      const result = timingSafeEqual(hashedBuf, suppliedBuf);
      console.log(`\u{1F512} Scrypt comparison result: ${result}`);
      return result;
    } catch (error) {
      console.error("Scrypt comparison error:", error);
      return false;
    }
  }
  console.log(`\u274C Unknown password format: ${stored.substring(0, 10)}...`);
  return false;
}
var scryptAsync;
var init_auth = __esm({
  "src/auth.ts"() {
    "use strict";
    scryptAsync = promisify(scrypt);
  }
});

// src/jwt-auth.ts
var jwt_auth_exports = {};
__export(jwt_auth_exports, {
  authMiddleware: () => authMiddleware,
  generateToken: () => generateToken,
  getCurrentUser: () => getCurrentUser,
  loginHandler: () => loginHandler,
  logoutHandler: () => logoutHandler,
  verifyToken: () => verifyToken
});
import jwt from "jsonwebtoken";
function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    secret,
    { expiresIn: "1h" }
  );
}
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return jwt.verify(token, secret);
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header provided" });
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid authorization header format" });
  }
  const token = parts[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
async function loginHandler(req, res) {
  try {
    const { username, password } = req.body;
    if (!password || password === "" || password === null || password === void 0) {
      const user2 = await storage.getUserByUsername(username);
      if (!user2) {
        return res.status(401).json({ message: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u062E\u0627\u0637\u0626\u0629 - \u0631\u0627\u062C\u0639 \u0644\u062C\u0646\u0629 \u0627\u0644\u0639\u0627\u0626\u0644\u0629" });
      }
      const isPromotedHead = user2.role === "admin" && /^\d{9}$/.test(user2.username);
      if (user2.role !== "head" && !isPromotedHead) {
        return res.status(401).json({ message: "\u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644: \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0629" });
      }
      if (user2.role === "head") {
        const family = await storage.getFamilyByUserId(user2.id);
        if (!family) {
          return res.status(401).json({ message: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u062E\u0627\u0637\u0626\u0629 - \u0631\u0627\u062C\u0639 \u0644\u062C\u0646\u0629 \u0627\u0644\u0639\u0627\u0626\u0644\u0629" });
        }
      }
      if (user2.lockoutUntil && /* @__PURE__ */ new Date() < user2.lockoutUntil) {
        const remainingMinutes = Math.ceil((user2.lockoutUntil.getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60));
        return res.status(423).json({ message: `\u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u062D\u0638\u0648\u0631 \u0645\u0624\u0642\u062A\u0627\u064B. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0628\u0639\u062F ${remainingMinutes} \u062F\u0642\u064A\u0642\u0629` });
      }
      await storage.updateUser(user2.id, {
        failedLoginAttempts: 0,
        lockoutUntil: null
      });
      const token2 = generateToken(user2);
      return res.status(200).json({ token: token2, user: user2 });
    }
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u062E\u0627\u0637\u0626\u0629 - \u0631\u0627\u062C\u0639 \u0644\u062C\u0646\u0629 \u0627\u0644\u0639\u0627\u0626\u0644\u0629" });
    }
    if (user.lockoutUntil && /* @__PURE__ */ new Date() < user.lockoutUntil) {
      const remainingMinutes = Math.ceil((user.lockoutUntil.getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60));
      return res.status(423).json({ message: `\u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u062D\u0638\u0648\u0631 \u0645\u0624\u0642\u062A\u0627\u064B. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0628\u0639\u062F ${remainingMinutes} \u062F\u0642\u064A\u0642\u0629` });
    }
    const settings2 = await storage.getAllSettings();
    const settingsMap = Object.fromEntries(settings2.map((s) => [s.key, s.value]));
    const maxLoginAttempts = parseInt(settingsMap.maxLoginAttempts || "5");
    const lockoutDuration = parseInt(settingsMap.lockoutDuration || "15");
    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
      let lockoutUntil = null;
      if (newFailedAttempts >= maxLoginAttempts) {
        lockoutUntil = new Date(Date.now() + lockoutDuration * 60 * 1e3);
      }
      await storage.updateUser(user.id, {
        failedLoginAttempts: newFailedAttempts,
        lockoutUntil
      });
      try {
        await storage.createLog({
          type: "failed_login",
          message: `\u0645\u062D\u0627\u0648\u0644\u0629 \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644 \u0641\u0627\u0634\u0644\u0629 \u0644\u0645\u0633\u062A\u062E\u062F\u0645 ${user.username} (${user.role})`,
          userId: user.id
        });
      } catch (logError) {
        console.error("Error logging failed login event:", logError);
      }
      if (lockoutUntil) {
        return res.status(423).json({ message: `\u062A\u0645 \u062D\u0638\u0631 \u0627\u0644\u062D\u0633\u0627\u0628 \u0644\u0645\u062F\u0629 ${lockoutDuration} \u062F\u0642\u064A\u0642\u0629 \u0628\u0633\u0628\u0628 \u0645\u062D\u0627\u0648\u0644\u0627\u062A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0641\u0627\u0634\u0644\u0629 \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629` });
      } else {
        const remainingAttempts = maxLoginAttempts - newFailedAttempts;
        return res.status(401).json({ message: `\u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644: \u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629. \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u0645\u062A\u0628\u0642\u064A\u0629: ${remainingAttempts}` });
      }
    }
    await storage.updateUser(user.id, {
      failedLoginAttempts: 0,
      lockoutUntil: null
    });
    const token = generateToken(user);
    try {
      await storage.createLog({
        type: "login",
        message: `\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0645\u0633\u062A\u062E\u062F\u0645 ${user.username} (${user.role})`,
        userId: user.id
      });
    } catch (logError) {
      console.error("Error logging login event:", logError);
    }
    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
  }
}
async function getCurrentUser(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
  }
}
function logoutHandler(req, res) {
  res.status(200).json({ message: "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C \u0628\u0646\u062C\u0627\u062D" });
}
var init_jwt_auth = __esm({
  "src/jwt-auth.ts"() {
    "use strict";
    init_storage();
    init_auth();
  }
});

// src/services/bulk-import.service.ts
var bulk_import_service_exports = {};
__export(bulk_import_service_exports, {
  BulkImportService: () => BulkImportService
});
var BulkImportService;
var init_bulk_import_service = __esm({
  "src/services/bulk-import.service.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_auth();
    BulkImportService = class {
      /**
       * Performs a bulk insert of family data with associated user creation
       */
      static async bulkInsertFamilies(familiesData, chunkSize = 50) {
        const results = [];
        for (let i = 0; i < familiesData.length; i += chunkSize) {
          const chunk = familiesData.slice(i, i + chunkSize);
          const processedChunk = await Promise.all(chunk.map(async (family) => {
            const hashedPassword = await hashPassword(family.husbandID);
            return {
              ...family,
              hashedPassword
            };
          }));
          const result = await db.transaction(async (tx) => {
            const userResults = await tx.insert(users).values(
              processedChunk.map((family) => ({
                username: family.husbandID,
                password: family.hashedPassword,
                // Use the pre-hashed password
                role: "head",
                gender: family.headGender || family.gender || "male",
                phone: family.primaryPhone || null
              }))
            ).returning({ id: users.id, username: users.username });
            const familyResults = await tx.insert(families2).values(
              processedChunk.map((family, index2) => ({
                userId: userResults[index2].id,
                husbandName: family.husbandName,
                husbandID: family.husbandID,
                husbandBirthDate: family.husbandBirthDate || null,
                husbandJob: family.husbandJob || null,
                hasDisability: family.hasDisability || false,
                disabilityType: family.disabilityType || null,
                hasChronicIllness: family.hasChronicIllness || false,
                chronicIllnessType: family.chronicIllnessType || null,
                wifeName: family.wifeName || null,
                wifeID: family.wifeID || null,
                wifeBirthDate: family.wifeBirthDate || null,
                wifeJob: family.wifeJob || null,
                wifePregnant: family.wifePregnant || false,
                wifeHasDisability: family.wifeHasDisability || false,
                wifeDisabilityType: family.wifeDisabilityType || null,
                wifeHasChronicIllness: family.wifeHasChronicIllness || false,
                wifeChronicIllnessType: family.wifeChronicIllnessType || null,
                primaryPhone: family.primaryPhone || null,
                secondaryPhone: family.secondaryPhone || null,
                originalResidence: family.originalResidence || null,
                currentHousing: family.currentHousing || null,
                isDisplaced: family.isDisplaced || false,
                displacedLocation: family.displacedLocation || null,
                isAbroad: family.isAbroad || false,
                warDamage2023: family.warDamage2023 || false,
                warDamageDescription: family.warDamageDescription || null,
                branch: family.branch || null,
                landmarkNear: family.landmarkNear || null,
                totalMembers: family.totalMembers || 0,
                numMales: family.numMales || 0,
                numFemales: family.numFemales || 0,
                socialStatus: family.socialStatus || null,
                adminNotes: family.adminNotes || null
              }))
            ).execute();
            return { userResults, familyResults };
          });
          results.push(result);
        }
        return results;
      }
      /**
       * Validates family data before import
       */
      static validateFamilyData(familiesData) {
        const valid = [];
        const errors = [];
        for (let i = 0; i < familiesData.length; i++) {
          const item = familiesData[i];
          const rowIndex = i + 2;
          const validationErrors = [];
          if (!item.husbandName) {
            validationErrors.push(`\u0627\u0644\u0635\u0641 ${rowIndex}: \u0627\u0633\u0645 \u0631\u0628 \u0627\u0644\u0623\u0633\u0631\u0629 \u0645\u0637\u0644\u0648\u0628`);
          }
          if (!item.husbandID) {
            validationErrors.push(`\u0627\u0644\u0635\u0641 ${rowIndex}: \u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629 \u0645\u0637\u0644\u0648\u0628`);
          } else {
            const husbandID = String(item.husbandID);
            if (!/^\d{9}$/.test(husbandID)) {
              validationErrors.push(`\u0627\u0644\u0635\u0641 ${rowIndex}: \u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629 ${husbandID} \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 9 \u0623\u0631\u0642\u0627\u0645`);
            }
          }
          if (item.wifeID && !/^\d{9}$/.test(String(item.wifeID))) {
            validationErrors.push(`\u0627\u0644\u0635\u0641 ${rowIndex}: \u0631\u0642\u0645 \u0647\u0648\u064A\u0629 \u0627\u0644\u0632\u0648\u062C\u0629 ${item.wifeID} \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 9 \u0623\u0631\u0642\u0627\u0645`);
          }
          if (validationErrors.length > 0) {
            errors.push(...validationErrors);
          } else {
            valid.push({
              husbandName: String(item.husbandName || ""),
              husbandID: String(item.husbandID),
              husbandBirthDate: item.husbandBirthDate || null,
              husbandJob: item.husbandJob || null,
              hasDisability: Boolean(item.hasDisability) || false,
              disabilityType: item.disabilityType || null,
              hasChronicIllness: Boolean(item.hasChronicIllness) || false,
              chronicIllnessType: item.chronicIllnessType || null,
              wifeName: item.wifeName || null,
              wifeID: item.wifeID || null,
              wifeBirthDate: item.wifeBirthDate || null,
              wifeJob: item.wifeJob || null,
              wifePregnant: Boolean(item.wifePregnant) || false,
              wifeHasDisability: Boolean(item.wifeHasDisability) || false,
              wifeDisabilityType: item.wifeDisabilityType || null,
              wifeHasChronicIllness: Boolean(item.wifeHasChronicIllness) || false,
              wifeChronicIllnessType: item.wifeChronicIllnessType || null,
              primaryPhone: item.primaryPhone || null,
              secondaryPhone: item.secondaryPhone || null,
              originalResidence: item.originalResidence || null,
              currentHousing: item.currentHousing || null,
              isDisplaced: Boolean(item.isDisplaced) || false,
              displacedLocation: item.displacedLocation || null,
              isAbroad: Boolean(item.isAbroad) || false,
              warDamage2023: Boolean(item.warDamage2023) || false,
              warDamageDescription: item.warDamageDescription || null,
              branch: item.branch || null,
              landmarkNear: item.landmarkNear || null,
              totalMembers: parseInt(String(item.totalMembers)) || 0,
              numMales: parseInt(String(item.numMales)) || 0,
              numFemales: parseInt(String(item.numFemales)) || 0,
              socialStatus: item.socialStatus || null,
              adminNotes: item.adminNotes || null,
              gender: item.gender || "male",
              headGender: item.headGender || "male"
            });
          }
        }
        return { valid, errors };
      }
      /**
       * Checks for duplicate IDs in the batch
       */
      static checkForDuplicates(familiesData) {
        const ids = /* @__PURE__ */ new Set();
        const duplicates = [];
        for (const family of familiesData) {
          if (family.husbandID) {
            if (ids.has(family.husbandID)) {
              duplicates.push(family.husbandID);
            } else {
              ids.add(family.husbandID);
            }
          }
        }
        return duplicates;
      }
      /**
       * Performs a fast import by bypassing individual validations (for trusted data)
       */
      static async fastBulkImport(familiesData) {
        const { valid, errors } = this.validateFamilyData(familiesData);
        if (errors.length > 0) {
          throw new Error(`Validation failed: ${errors.join(", ")}`);
        }
        const duplicates = this.checkForDuplicates(valid);
        if (duplicates.length > 0) {
          throw new Error(`Duplicate IDs found: ${duplicates.join(", ")}`);
        }
        return await this.bulkInsertFamilies(valid);
      }
    };
  }
});

// package.json
var require_package = __commonJS({
  "package.json"(exports, module) {
    module.exports = {
      name: "family-management-backend",
      version: "1.0.0",
      type: "module",
      license: "MIT",
      scripts: {
        dev: "cross-env NODE_ENV=development tsx src/index.ts",
        build: "esbuild netlify/functions/api.ts --platform=node --packages=external --bundle --format=esm --outdir=netlify/functions && esbuild src/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
        start: "NODE_ENV=production node dist/index.js",
        check: "tsc",
        "db:push": "drizzle-kit push",
        "db:migrate": "node ./migrate.js",
        "db:generate": "drizzle-kit generate",
        "db:drop-migrations": "rmdir /s /q migrations && mkdir migrations && (echo {} > migrations\\meta\\_journal.json)",
        "db:reset": "npm run db:drop-migrations && npm run db:generate && npm run db:migrate",
        "db:status": "drizzle-kit check",
        "db:studio": "drizzle-kit studio",
        seed: "tsx src/seed.ts",
        "heroku-postbuild": "npm run build"
      },
      dependencies: {
        "@neondatabase/serverless": "^0.10.4",
        "@netlify/functions": "^2.8.1",
        bcryptjs: "^3.0.2",
        cors: "^2.8.5",
        dotenv: "^17.2.1",
        "drizzle-kit": "^0.30.4",
        "drizzle-orm": "^0.39.1",
        "drizzle-zod": "^0.7.0",
        esbuild: "^0.25.0",
        express: "^4.21.2",
        jsonwebtoken: "^9.0.2",
        multer: "^1.4.5-lts.1",
        nanoid: "^5.1.5",
        pg: "^8.16.3",
        "serverless-http": "^3.2.0",
        ws: "^8.18.0",
        xlsx: "^0.18.5",
        zod: "^3.24.2",
        "zod-validation-error": "^3.4.0"
      },
      devDependencies: {
        "@types/cors": "^2.8.17",
        "@types/express": "4.17.21",
        "@types/jsonwebtoken": "^9.0.10",
        "@types/multer": "^1.4.12",
        "@types/node": "^20.16.11",
        "@types/ws": "^8.5.13",
        "cross-env": "^10.1.0",
        tsx: "^4.19.1",
        typescript: "5.6.3"
      },
      optionalDependencies: {
        bufferutil: "^4.0.8"
      }
    };
  }
});

// netlify/functions/api.ts
import express from "express";

// src/routes.ts
init_jwt_auth();
init_auth();
init_storage();
init_schema();
init_db();
init_db_retry();
import { createServer } from "http";
import { z as z2 } from "zod";
import multer from "multer";
import cors from "cors";
import pg2 from "pg";
import * as XLSX from "xlsx";
var upload = multer({ storage: multer.memoryStorage() });
function getRequestTypeInArabic(type) {
  switch (type) {
    case "financial":
      return "\u0645\u0633\u0627\u0639\u062F\u0629 \u0645\u0627\u0644\u064A\u0629";
    case "medical":
      return "\u0645\u0633\u0627\u0639\u062F\u0629 \u0637\u0628\u064A\u0629";
    case "damage":
      return "\u062A\u0639\u0648\u064A\u0636 \u0623\u0636\u0631\u0627\u0631";
    default:
      return type;
  }
}
function isHeadOrDualRole(user, family) {
  return user.role === "head" || user.role === "admin" && family;
}
function getSpouseFieldName(headGender) {
  if (!headGender || headGender === "male") {
    return "wife";
  } else if (headGender === "female") {
    return "husband";
  } else {
    return "wife";
  }
}
function getSpouseDataWithGenderLabel(family, headGender) {
  const spouseFieldName = getSpouseFieldName(headGender);
  if (!family.wifeName) {
    return null;
  }
  return {
    id: family.id,
    familyId: family.id,
    [`${spouseFieldName}Name`]: family.wifeName,
    [`${spouseFieldName}ID`]: family.wifeID,
    [`${spouseFieldName}BirthDate`]: family.wifeBirthDate,
    [`${spouseFieldName}Job`]: family.wifeJob,
    [`${spouseFieldName}Pregnant`]: family.wifePregnant,
    createdAt: family.createdAt
  };
}
async function getFamilyByIdOrDualRole(familyId) {
  let family = await storage.getFamily(familyId);
  if (!family) {
    const allFamilies = await storage.getAllFamilies();
    family = allFamilies.find((f) => f.id === familyId);
  }
  return family;
}
function registerRoutes(app2) {
  app2.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: false,
    // No longer need credentials for JWT
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  app2.get("/", (req, res) => {
    res.json({
      message: "Family Management System API",
      version: "1.0.0",
      status: "running",
      endpoints: {
        auth: "/api/login, /api/logout, /api/user",
        health: "/api/health",
        settings: "/api/settings, /api/public/settings",
        families: "/api/families, /api/family",
        users: "/api/admin/users",
        requests: "/api/requests",
        notifications: "/api/notifications"
      },
      documentation: "Family management system backend API"
    });
  });
  app2.get("/api", (req, res) => {
    res.json({
      message: "Family Management System API",
      version: "1.0.0",
      status: "running",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      availableEndpoints: [
        "GET /api/health - System health check",
        "POST /api/login - User authentication",
        "POST /api/logout - User logout",
        "GET /api/user - Get current user info",
        "GET /api/settings - Get system settings (authenticated)",
        "GET /api/public/settings - Get public settings",
        "GET /api/families - Get families list (admin)",
        "GET /api/family - Get family data",
        "POST /api/family - Create family",
        "PUT /api/family/:id - Update family",
        "GET /api/requests - Get requests",
        "POST /api/requests - Create request",
        "GET /api/notifications - Get notifications"
      ]
    });
  });
  app2.post("/api/login", loginHandler);
  app2.post("/api/logout", logoutHandler);
  app2.get("/api/user", authMiddleware, getCurrentUser);
  app2.get("/api/health", async (req, res) => {
    try {
      const dbHealth = await checkDatabaseHealth();
      const health = {
        status: dbHealth.healthy ? "healthy" : "unhealthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        database: {
          healthy: dbHealth.healthy,
          error: dbHealth.error || null
        },
        serverless: {
          platform: "netlify-functions",
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }
      };
      if (dbHealth.healthy) {
        res.status(200).json(health);
      } else {
        res.status(503).json(health);
      }
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(503).json({
        status: "error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        error: error.message
      });
    }
  });
  app2.post("/api/admin/import-heads/init", authMiddleware, upload.single("excel"), async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) {
      console.log(`\u274C Unauthorized import attempt by user: ${req.user?.username || "anonymous"}`);
      return res.sendStatus(403);
    }
    try {
      if (!req.file) {
        console.log("\u274C No file uploaded");
        return res.status(400).json({ message: "\u064A\u0631\u062C\u0649 \u0631\u0641\u0639 \u0645\u0644\u0641 Excel" });
      }
      console.log(`\u{1F4CA} Initializing import session for user: ${req.user.username}`);
      console.log(`\u{1F4C1} File uploaded: ${req.file.originalname}, Size: ${req.file.size} bytes`);
      if (req.file.size > 20 * 1024 * 1024) {
        console.log(`\u274C File too large: ${req.file.size} bytes`);
        return res.status(400).json({ message: "\u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u0643\u0628\u064A\u0631 \u062C\u062F\u0627\u064B. \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 20 \u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A" });
      }
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      console.log(`\u{1F4CB} Processing sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      if (!data || data.length === 0) {
        console.log("\u274C Empty Excel file");
        return res.status(400).json({ message: "\u0645\u0644\u0641 Excel \u0641\u0627\u0631\u063A \u0623\u0648 \u0644\u0627 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A" });
      }
      console.log(`\u{1F4CA} Found ${data.length} rows to process`);
      const transformedData = [];
      const errors = [];
      const allHusbandIDs = /* @__PURE__ */ new Set();
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowIndex = i + 2;
        try {
          const husbandName = row["husbandName"] || row["husband_name"] || row["\u0627\u0633\u0645 \u0631\u0628 \u0627\u0644\u0623\u0633\u0631\u0629"];
          const husbandID = row["husbandID"] || row["husband_id"] || row["\u0631\u0642\u0645 \u0647\u0648\u064A\u0629 \u0631\u0628 \u0627\u0644\u0623\u0633\u0631\u0629"];
          const processedHusbandID = String(husbandID || "").trim();
          const processedHusbandName = String(husbandName || "").trim();
          if (!processedHusbandName || !processedHusbandID) {
            const missingFields = [];
            if (!processedHusbandName) missingFields.push("\u0627\u0633\u0645 \u0631\u0628 \u0627\u0644\u0623\u0633\u0631\u0629");
            if (!processedHusbandID) missingFields.push("\u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629");
            errors.push(`\u0627\u0644\u0635\u0641 ${rowIndex}: \u0627\u0644\u062D\u0642\u0648\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0645\u0641\u0642\u0648\u062F\u0629 (${missingFields.join(" \u0648 ")})`);
            continue;
          }
          if (!/^\d{9}$/.test(processedHusbandID)) {
            errors.push(`\u0627\u0644\u0635\u0641 ${rowIndex}: \u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629 ${processedHusbandID} \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 9 \u0623\u0631\u0642\u0627\u0645`);
            continue;
          }
          const wifeID = row["wifeID"] || row["wife_id"] || row["\u0631\u0642\u0645 \u0647\u0648\u064A\u0629 \u0627\u0644\u0632\u0648\u062C\u0629"] || null;
          if (wifeID && !/^\d{9}$/.test(String(wifeID))) {
            errors.push(`\u0627\u0644\u0635\u0641 ${rowIndex}: \u0631\u0642\u0645 \u0647\u0648\u064A\u0629 \u0627\u0644\u0632\u0648\u062C\u0629 ${wifeID} \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 9 \u0623\u0631\u0642\u0627\u0645`);
            continue;
          }
          if (allHusbandIDs.has(processedHusbandID)) {
            errors.push(`\u0627\u0644\u0635\u0641 ${rowIndex}: \u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629 ${processedHusbandID} \u0645\u0643\u0631\u0631 \u0641\u064A \u0627\u0644\u0645\u0644\u0641`);
            continue;
          }
          allHusbandIDs.add(processedHusbandID);
          transformedData.push({
            husbandName: processedHusbandName,
            husbandID: processedHusbandID,
            husbandBirthDate: row["husbandBirthDate"] || row["husband_birth_date"] || row["\u062A\u0627\u0631\u064A\u062E \u0645\u064A\u0644\u0627\u062F \u0631\u0628 \u0627\u0644\u0623\u0633\u0631\u0629"] || null,
            husbandJob: row["husbandJob"] || row["husband_job"] || row["\u0648\u0638\u064A\u0641\u0629 \u0631\u0628 \u0627\u0644\u0623\u0633\u0631\u0629"] || null,
            hasDisability: Boolean(row["hasDisability"] || row["has_disability"] || row["\u0644\u062F\u064A\u0647 \u0625\u0639\u0627\u0642\u0629"] || false),
            disabilityType: row["disabilityType"] || row["disability_type"] || row["\u0646\u0648\u0639 \u0627\u0644\u0625\u0639\u0627\u0642\u0629"] || null,
            hasChronicIllness: Boolean(row["hasChronicIllness"] || row["has_chronic_illness"] || row["\u0644\u062F\u064A\u0647 \u0645\u0631\u0636 \u0645\u0632\u0645\u0646"] || false),
            chronicIllnessType: row["chronicIllnessType"] || row["chronic_illness_type"] || row["\u0646\u0648\u0639 \u0627\u0644\u0645\u0631\u0636 \u0627\u0644\u0645\u0632\u0645\u0646"] || null,
            wifeName: row["wifeName"] || row["wife_name"] || row["\u0627\u0633\u0645 \u0627\u0644\u0632\u0648\u062C\u0629"] || null,
            wifeID,
            wifeBirthDate: row["wifeBirthDate"] || row["wife_birth_date"] || row["\u062A\u0627\u0631\u064A\u062E \u0645\u064A\u0644\u0627\u062F \u0627\u0644\u0632\u0648\u062C\u0629"] || null,
            wifeJob: row["wifeJob"] || row["wife_job"] || row["\u0648\u0638\u064A\u0641\u0629 \u0627\u0644\u0632\u0648\u062C\u0629"] || null,
            wifePregnant: Boolean(row["wifePregnant"] || row["wife_pregnant"] || row["\u0627\u0644\u0632\u0648\u062C\u0629 \u062D\u0627\u0645\u0644"] || false),
            wifeHasDisability: Boolean(row["wifeHasDisability"] || row["wife_has_disability"] || row["\u0627\u0644\u0632\u0648\u062C\u0629 \u062A\u0639\u0627\u0646\u064A \u0645\u0646 \u0625\u0639\u0627\u0642\u0629"] || false),
            wifeDisabilityType: row["wifeDisabilityType"] || row["wife_disability_type"] || row["\u0646\u0648\u0639 \u0625\u0639\u0627\u0642\u0629 \u0627\u0644\u0632\u0648\u062C\u0629"] || null,
            wifeHasChronicIllness: Boolean(row["wifeHasChronicIllness"] || row["wife_has_chronic_illness"] || row["\u0627\u0644\u0632\u0648\u062C\u0629 \u062A\u0639\u0627\u0646\u064A \u0645\u0646 \u0645\u0631\u0636 \u0645\u0632\u0645\u0646"] || false),
            wifeChronicIllnessType: row["wifeChronicIllnessType"] || row["wife_chronic_illness_type"] || row["\u0646\u0648\u0639 \u0645\u0631\u0636 \u0627\u0644\u0632\u0648\u062C\u0629 \u0627\u0644\u0645\u0632\u0645\u0646"] || null,
            primaryPhone: row["primaryPhone"] || row["primary_phone"] || row["\u0627\u0644\u0647\u0627\u062A\u0641 \u0627\u0644\u0631\u0626\u064A\u0633\u064A"] ? String(row["primaryPhone"] || row["primary_phone"] || row["\u0627\u0644\u0647\u0627\u062A\u0641 \u0627\u0644\u0631\u0626\u064A\u0633\u064A"]) : null,
            secondaryPhone: row["secondaryPhone"] || row["secondary_phone"] || row["\u0627\u0644\u0647\u0627\u062A\u0641 \u0627\u0644\u062B\u0627\u0646\u0648\u064A"] ? String(row["secondaryPhone"] || row["secondary_phone"] || row["\u0627\u0644\u0647\u0627\u062A\u0641 \u0627\u0644\u062B\u0627\u0646\u0648\u064A"]) : null,
            originalResidence: row["originalResidence"] || row["original_residence"] || row["\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0623\u0635\u0644\u064A\u0629"] || null,
            currentHousing: row["currentHousing"] || row["current_housing"] || row["\u0645\u0643\u0627\u0646 \u0627\u0644\u0633\u0643\u0646 \u0627\u0644\u062D\u0627\u0644\u064A"] || null,
            isDisplaced: Boolean(row["isDisplaced"] || row["is_displaced"] || row["\u0645\u064F\u0647\u062C\u0651\u0631"] || false),
            displacedLocation: row["displacedLocation"] || row["displaced_location"] || row["\u0645\u0643\u0627\u0646 \u0627\u0644\u062A\u0647\u062C\u064A\u0631"] || null,
            isAbroad: Boolean(row["isAbroad"] || row["is_abroad"] || row["\u0641\u064A \u0627\u0644\u062E\u0627\u0631\u062C"] || false),
            warDamage2023: Boolean(row["warDamage2023"] || row["war_damage_2023"] || row["\u062A\u0636\u0631\u0631 \u0645\u0646 \u0627\u0644\u062D\u0631\u0628 2023"] || false),
            warDamageDescription: row["warDamageDescription"] || row["war_damage_description"] || row["\u0648\u0635\u0641 \u0627\u0644\u0636\u0631\u0631"] || null,
            branch: row["branch"] || row["\u0627\u0644\u0641\u0631\u0639"] || null,
            landmarkNear: row["landmarkNear"] || row["landmark_near"] || row["\u0645\u0639\u0644\u0645 \u0642\u0631\u064A\u0628"] || null,
            totalMembers: parseInt(String(row["totalMembers"] || row["total_members"] || row["\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0623\u0641\u0631\u0627\u062F"] || 0)) || 0,
            numMales: parseInt(String(row["numMales"] || row["num_males"] || row["\u0639\u062F\u062F \u0627\u0644\u0630\u0643\u0648\u0631"] || 0)) || 0,
            numFemales: parseInt(String(row["numFemales"] || row["num_females"] || row["\u0639\u062F\u062F \u0627\u0644\u0625\u0646\u0627\u062B"] || 0)) || 0,
            socialStatus: row["socialStatus"] || row["social_status"] || row["\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629"] || null,
            adminNotes: row["adminNotes"] || row["admin_notes"] || row["\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u0634\u0631\u0641"] || null,
            gender: row["gender"] || row["\u0627\u0644\u062C\u0646\u0633"] || "male",
            headGender: row["headGender"] || row["head_gender"] || row["\u062C\u0646\u0633 \u0631\u0628 \u0627\u0644\u0623\u0633\u0631\u0629"] || "male"
          });
        } catch (error) {
          console.error(`\u274C Error processing row ${rowIndex}:`, error.message);
          errors.push(`\u0627\u0644\u0635\u0641 ${rowIndex}: ${error.message}`);
        }
      }
      console.log(`\u2705 Validation completed: ${transformedData.length} valid rows, ${errors.length} invalid rows`);
      const sessionId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionData = {
        sessionId,
        userId: req.user.id,
        totalRecords: data.length,
        // Total in original file
        validRecords: transformedData.length,
        invalidRecords: errors.length,
        uploadedAt: /* @__PURE__ */ new Date(),
        originalFilename: req.file.originalname,
        transformedData,
        // Store only the valid data
        invalidRows: errors,
        // Store invalid rows for reporting
        processed: 0,
        errors: []
      };
      if (!global.importSessions) {
        global.importSessions = /* @__PURE__ */ new Map();
      }
      global.importSessions.set(sessionId, sessionData);
      console.log(`\u2705 Import session initialized: ${sessionId} for ${transformedData.length} valid records (skipped ${errors.length} invalid rows)`);
      res.json({
        sessionId,
        totalRecords: data.length,
        validRecords: transformedData.length,
        invalidRecords: errors.length,
        invalidRows: errors.slice(0, 20),
        // Include first 20 invalid rows in the response
        message: errors.length > 0 ? `\u062A\u0645 \u062A\u0647\u064A\u0626\u0629 \u062C\u0644\u0633\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0644\u0640 ${transformedData.length} \u0633\u062C\u0644 \u0635\u062D\u064A\u062D (\u062A\u0645 \u062A\u062E\u0637\u064A ${errors.length} \u0633\u062C\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D)` : `\u062A\u0645 \u062A\u0647\u064A\u0626\u0629 \u062C\u0644\u0633\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0644\u0640 ${transformedData.length} \u0633\u062C\u0644`
      });
    } catch (error) {
      console.error("\u274C Error initializing import session:", error);
      res.status(500).json({
        message: "\u062E\u0637\u0623 \u0641\u064A \u062A\u0647\u064A\u0626\u0629 \u062C\u0644\u0633\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F",
        error: error.message
      });
    }
  });
  app2.post("/api/admin/import-heads/chunk", authMiddleware, async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    try {
      const { sessionId, startIdx, chunkSize = 50 } = req.body;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }
      if (!global.importSessions) {
        global.importSessions = /* @__PURE__ */ new Map();
      }
      const session = global.importSessions.get(sessionId);
      if (!session) {
        return res.status(400).json({ message: "Invalid session ID" });
      }
      const startIndex = startIdx || session.processed || 0;
      const endIndex = Math.min(startIndex + chunkSize, session.transformedData.length);
      const chunk = session.transformedData.slice(startIndex, endIndex);
      if (chunk.length === 0) {
        const progress2 = 100;
        const processed = session.totalRecords;
        res.json({
          success: true,
          processed,
          total: session.totalRecords,
          progress: progress2,
          sessionId,
          message: `\u0627\u0643\u062A\u0645\u0644 \u0627\u0633\u062A\u064A\u0631\u0627\u062F ${processed} \u0633\u062C\u0644`,
          done: true
        });
        return;
      }
      console.log(`\u{1F4CA} Processing chunk for session ${sessionId}: ${chunk.length} records, start: ${startIndex}, end: ${endIndex}`);
      const { BulkImportService: BulkImportService2 } = await Promise.resolve().then(() => (init_bulk_import_service(), bulk_import_service_exports));
      const result = await BulkImportService2.fastBulkImport(chunk);
      session.processed = endIndex;
      const progress = Math.round(session.processed / session.totalRecords * 100);
      console.log(`\u2705 Chunk processed: ${session.processed}/${session.totalRecords} (${progress}%)`);
      res.json({
        success: true,
        processed: session.processed,
        total: session.totalRecords,
        progress,
        sessionId,
        message: `\u062A\u0645\u062A \u0645\u0639\u0627\u0644\u062C\u0629 ${session.processed}/${session.totalRecords} \u0633\u062C\u0644`,
        done: session.processed >= session.totalRecords
      });
    } catch (error) {
      console.error("\u274C Error processing import chunk:", error);
      res.status(500).json({
        message: "\u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u062C\u0632\u0621 \u0645\u0646 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A",
        error: error.message
      });
    }
  });
  app2.get("/api/admin/import-heads/status/:sessionId", authMiddleware, async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    try {
      const { sessionId } = req.params;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }
      if (!global.importSessions) {
        global.importSessions = /* @__PURE__ */ new Map();
      }
      const session = global.importSessions.get(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      const progress = session.totalRecords > 0 ? Math.round(session.processed / session.totalRecords * 100) : 0;
      res.json({
        sessionId: session.sessionId,
        processed: session.processed,
        total: session.totalRecords,
        validRecords: session.validRecords,
        invalidRecords: session.invalidRecords,
        invalidRows: session.invalidRows,
        // Include invalid rows in status
        progress,
        status: session.processed >= session.totalRecords ? "completed" : "in-progress",
        message: `\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062A\u0642\u062F\u0645 ${progress}%`
      });
    } catch (error) {
      console.error("\u274C Error getting import status:", error);
      res.status(500).json({
        message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062D\u0627\u0644\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F",
        error: error.message
      });
    }
  });
  app2.post("/api/admin/import-heads/finalize", authMiddleware, async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }
      if (!global.importSessions) {
        global.importSessions = /* @__PURE__ */ new Map();
      }
      const session = global.importSessions.get(sessionId);
      if (!session) {
        return res.status(400).json({ message: "Invalid session ID" });
      }
      global.importSessions.delete(sessionId);
      console.log(`\u2705 Import session ${sessionId} finalized`);
      res.json({
        success: true,
        message: `\u062A\u0645 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 \u0645\u0646 \u0627\u0633\u062A\u064A\u0631\u0627\u062F ${session.processed} \u0633\u062C\u0644 \u0628\u0646\u062C\u0627\u062D`
      });
    } catch (error) {
      console.error("\u274C Error finalizing import session:", error);
      res.status(500).json({
        message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0647\u0627\u0621 \u062C\u0644\u0633\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F",
        error: error.message
      });
    }
  });
  app2.get("/api/family", authMiddleware, async (req, res) => {
    try {
      const family = await storage.getFamilyByUserId(req.user.id);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      const user = await storage.getUser(req.user.id);
      const spouse = family.wifeName ? getSpouseDataWithGenderLabel(family, user?.gender || null) : null;
      const members2 = await storage.getMembersByFamilyId(family.id);
      const orphans3 = await storage.getOrphansByFamilyId(family.id);
      res.json({ ...family, spouse, members: members2, orphans: orphans3, userGender: user?.gender });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/family", authMiddleware, async (req, res) => {
    try {
      const familyData = insertFamilySchema.parse(req.body);
      familyData.userId = req.user.id;
      const family = await storage.createFamily(familyData);
      await storage.createLog({
        type: "family_creation",
        message: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0639\u0627\u0626\u0644\u0629 \u062C\u062F\u064A\u062F\u0629 ${family.husbandName} \u0645\u0646 \u0642\u0628\u0644 ${req.user.username}`,
        userId: req.user.id
      });
      res.status(201).json(family);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.put("/api/family/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const familyData = insertFamilySchema.partial().parse(req.body);
      if (req.user.role === "head") {
        const family2 = await storage.getFamily(id);
        if (!family2 || family2.userId !== req.user.id) {
          return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
        }
      }
      const family = await storage.updateFamily(id, familyData);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      await storage.createLog({
        type: "family_update",
        message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0639\u0627\u0626\u0644\u0629 ${family.husbandName} \u0645\u0646 \u0642\u0628\u0644 ${req.user.username}`,
        userId: req.user.id
      });
      res.json(family);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/family/:familyId/members", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const family = await storage.getFamily(familyId);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      if (isHeadOrDualRole(req.user, family) && family.userId !== req.user.id) {
        return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
      }
      const members2 = await storage.getMembersByFamilyId(familyId);
      res.json(members2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/members", authMiddleware, async (req, res) => {
    try {
      const family = await storage.getFamilyByUserId(req.user.id);
      if (!family) {
        return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      if (isHeadOrDualRole(req.user, family)) {
        const memberDataSchema = insertMemberSchema.omit({ familyId: true });
        const parsedData = memberDataSchema.parse(req.body);
        const memberData = { ...parsedData, familyId: family.id };
        const member = await storage.createMember(memberData);
        const memberFamily = await storage.getFamily(member.familyId);
        await storage.createLog({
          type: "member_creation",
          message: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0641\u0631\u062F \u062C\u062F\u064A\u062F ${member.fullName} \u0641\u064A \u0639\u0627\u0626\u0644\u0629 ${memberFamily?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0645\u0646 \u0642\u0628\u0644 ${req.user.username}`,
          userId: req.user.id
        });
        res.status(201).json(member);
      } else {
        return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
      }
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.put("/api/members/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const memberData = insertMemberSchema.partial().parse(req.body);
      const member = await storage.getMember(id);
      if (!member) return res.status(404).json({ message: "\u0627\u0644\u0641\u0631\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      const family = await storage.getFamily(member.familyId);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      if (isHeadOrDualRole(req.user, family) && family.userId !== req.user.id) {
        return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
      }
      const updatedMember = await storage.updateMember(id, memberData);
      if (!updatedMember) return res.status(404).json({ message: "\u0627\u0644\u0641\u0631\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      const memberFamily = await storage.getFamily(updatedMember.familyId);
      await storage.createLog({
        type: "member_update",
        message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0641\u0631\u062F ${updatedMember.fullName} \u0641\u064A \u0639\u0627\u0626\u0644\u0629 ${memberFamily?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0645\u0646 \u0642\u0628\u0644 ${req.user.username}`,
        userId: req.user.id
      });
      res.json(updatedMember);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.delete("/api/members/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Server: Attempting to delete member with ID:", id);
      console.log("Server: ID type:", typeof id);
      if (req.user.role === "head") {
        const member = await storage.getMember(id);
        console.log("Server: Found member:", member);
        if (!member) {
          console.log("Server: Member not found for ID:", id);
          return res.status(404).json({ message: "\u0627\u0644\u0641\u0631\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        }
        const family = await storage.getFamily(member.familyId);
        console.log("Server: Found family:", family);
        if (!family || family.userId !== req.user.id) {
          console.log("Server: Forbidden - family not found or user mismatch");
          return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
        }
        const success = await storage.deleteMember(id);
        console.log("Server: Delete result:", success);
        if (!success) {
          console.log("Server: Delete failed for ID:", id);
          return res.status(404).json({ message: "\u0627\u0644\u0641\u0631\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        }
        const memberFamily = await storage.getFamily(member.familyId);
        await storage.createLog({
          type: "member_deletion",
          message: `\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0641\u0631\u062F ${member.fullName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0641\u064A \u0639\u0627\u0626\u0644\u0629 ${memberFamily?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0645\u0646 \u0642\u0628\u0644 ${req.user.username}`,
          userId: req.user.id
        });
        res.sendStatus(204);
      } else {
        const member = await storage.getMember(id);
        const success = await storage.deleteMember(id);
        if (!success) {
          return res.status(404).json({ message: "\u0627\u0644\u0641\u0631\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        }
        const memberFamily = await storage.getFamily(member.familyId);
        await storage.createLog({
          type: "admin_member_deletion",
          message: `\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0641\u0631\u062F ${member?.fullName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0641\u064A \u0639\u0627\u0626\u0644\u0629 ${memberFamily?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0634\u0631\u0641 ${req.user.username}`,
          userId: req.user.id
        });
        res.sendStatus(204);
      }
    } catch (error) {
      console.error("Server: Error deleting member:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/family/:familyId/orphans", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const family = await storage.getFamily(familyId);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      if (isHeadOrDualRole(req.user, family) && family.userId !== req.user.id) {
        return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
      }
      const orphans3 = await storage.getOrphansByFamilyId(familyId);
      res.json(orphans3);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/orphans/upload", authMiddleware, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "\u0644\u0645 \u064A\u062A\u0645 \u062A\u062D\u0645\u064A\u0644 \u0623\u064A \u0635\u0648\u0631\u0629" });
      }
      const imageBuffer = req.file.buffer;
      const imageBase64 = `data:${req.file.mimetype};base64,${imageBuffer.toString("base64")}`;
      res.json({ image: imageBase64 });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0635\u0648\u0631\u0629" });
    }
  });
  app2.post("/api/orphans", authMiddleware, async (req, res) => {
    try {
      const family = await storage.getFamilyByUserId(req.user.id);
      if (!family) {
        return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      if (isHeadOrDualRole(req.user, family)) {
        const orphanDataSchema = insertOrphanSchema.omit({ familyId: true });
        const parsedData = orphanDataSchema.parse(req.body);
        const orphanData = { ...parsedData, familyId: family2.id };
        const orphan = await storage.createOrphan(orphanData);
        const family2 = await storage.getFamily(orphan.familyId);
        await storage.createLog({
          type: "orphan_creation",
          message: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u064A\u062A\u064A\u0645 \u062C\u062F\u064A\u062F ${orphan.orphanName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0641\u064A \u0639\u0627\u0626\u0644\u0629 ${family2?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0645\u0646 \u0642\u0628\u0644 ${req.user.username}`,
          userId: req.user.id
        });
        res.status(201).json(orphan);
      } else {
        return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
      }
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.put("/api/orphans/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orphanData = insertOrphanSchema.partial().extend({
        orphanID: z2.string().regex(/^\d{9}$/, "\u0631\u0642\u0645 \u0647\u0648\u064A\u0629 \u0627\u0644\u064A\u062A\u064A\u0645 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 9 \u0623\u0631\u0642\u0627\u0645").optional(),
        guardianID: z2.string().regex(/^\d{9}$/, "\u0631\u0642\u0645 \u0647\u0648\u064A\u0629 \u0627\u0644\u0648\u0635\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 9 \u0623\u0631\u0642\u0627\u0645").optional(),
        fatherID: z2.string().regex(/^\d{9}$/, "\u0631\u0642\u0645 \u0647\u0648\u064A\u0629 \u0627\u0644\u0627\u0628 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 9 \u0623\u0631\u0642\u0627\u0645").optional(),
        mobileNumber: z2.string().regex(/^\d{10}$/, "\u0631\u0642\u0645 \u0627\u0644\u062C\u0648\u0627\u0644 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 10 \u0623\u0631\u0642\u0627\u0645").optional(),
        backupMobileNumber: z2.string().regex(/^\d{10}$/, "\u0631\u0642\u0645 \u0627\u0644\u062C\u0648\u0627\u0644 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 10 \u0623\u0631\u0642\u0627\u0645").optional(),
        martyrdomType: z2.enum(["war_2023", "pre_2023_war", "natural_death"]).optional()
      }).parse(req.body);
      const orphan = await storage.getOrphan(id);
      if (!orphan) return res.status(404).json({ message: "\u0627\u0644\u064A\u062A\u064A\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      const family = await storage.getFamily(orphan.familyId);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      if (isHeadOrDualRole(req.user, family) && family.userId !== req.user.id) {
        return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
      }
      const updatedOrphan = await storage.updateOrphan(id, orphanData);
      if (!updatedOrphan) return res.status(404).json({ message: "\u0627\u0644\u064A\u062A\u064A\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      const familyForLogging = await storage.getFamily(updatedOrphan.familyId);
      await storage.createLog({
        type: "orphan_update",
        message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u064A\u062A\u064A\u0645 ${updatedOrphan.orphanName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0641\u064A \u0639\u0627\u0626\u0644\u0629 ${familyForLogging?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0645\u0646 \u0642\u0628\u0644 ${req.user.username}`,
        userId: req.user.id
      });
      res.json(updatedOrphan);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.delete("/api/orphans/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Server: Attempting to delete orphan with ID:", id);
      console.log("Server: ID type:", typeof id);
      if (req.user.role === "head") {
        const orphan = await storage.getOrphan(id);
        console.log("Server: Found orphan:", orphan);
        if (!orphan) {
          console.log("Server: Orphan not found for ID:", id);
          return res.status(404).json({ message: "\u0627\u0644\u064A\u062A\u064A\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        }
        const family = await storage.getFamily(orphan.familyId);
        console.log("Server: Found family:", family);
        if (!family || family.userId !== req.user.id) {
          console.log("Server: Forbidden - family not found or user mismatch");
          return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
        }
        const success = await storage.deleteOrphan(id);
        console.log("Server: Delete result:", success);
        if (!success) {
          console.log("Server: Delete failed for ID:", id);
          return res.status(404).json({ message: "\u0627\u0644\u064A\u062A\u064A\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        }
        const orphanFamily = await storage.getFamily(orphan.familyId);
        await storage.createLog({
          type: "orphan_deletion",
          message: `\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u064A\u062A\u064A\u0645 ${orphan.orphanName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0641\u064A \u0639\u0627\u0626\u0644\u0629 ${orphanFamily?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0645\u0646 \u0642\u0628\u0644 ${req.user.username}`,
          userId: req.user.id
        });
        res.sendStatus(204);
      } else {
        const orphan = await storage.getOrphan(id);
        const success = await storage.deleteOrphan(id);
        if (!success) {
          return res.status(404).json({ message: "\u0627\u0644\u064A\u062A\u064A\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        }
        const orphanFamily = await storage.getFamily(orphan.familyId);
        await storage.createLog({
          type: "admin_orphan_deletion",
          message: `\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u064A\u062A\u064A\u0645 ${orphan?.orphanName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0641\u064A \u0639\u0627\u0626\u0644\u0629 ${orphanFamily?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0634\u0631\u0641 ${req.user.username}`,
          userId: req.user.id
        });
        res.sendStatus(204);
      }
    } catch (error) {
      console.error("Server: Error deleting orphan:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/family/:familyId/spouse", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const family = await storage.getFamily(familyId);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      if (isHeadOrDualRole(req.user, family) && family.userId !== req.user.id) {
        return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
      }
      const user = await storage.getUser(family.userId);
      const spouseData = family.wifeName ? getSpouseDataWithGenderLabel(family, user?.gender || null) : null;
      res.json(spouseData);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/family/:familyId/spouse", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const family = await storage.getFamily(familyId);
      if (!family) {
        return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      if (isHeadOrDualRole(req.user, family) && family.userId !== req.user.id) {
        return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
      }
      if (family.wifeName) {
        return res.status(409).json({ message: "\u0627\u0644\u0632\u0648\u062C/\u0627\u0644\u0632\u0648\u062C\u0629 \u0645\u0648\u062C\u0648\u062F/\u0629 \u0645\u0633\u0628\u0642\u0627\u064B \u0644\u0647\u0630\u0647 \u0627\u0644\u0639\u0627\u0626\u0644\u0629" });
      }
      const { spouseName, spouseID, spouseBirthDate, spouseJob, spousePregnant } = req.body;
      const updatedFamily = await storage.updateFamily(familyId, {
        wifeName: spouseName,
        wifeID: spouseID,
        wifeBirthDate: spouseBirthDate,
        wifeJob: spouseJob,
        wifePregnant: spousePregnant || false
      });
      if (!updatedFamily) {
        return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      const user = await storage.getUser(family.userId);
      const spouseData = getSpouseDataWithGenderLabel(updatedFamily, user?.gender || null);
      res.status(201).json(spouseData);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.put("/api/family/:familyId/spouse", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const family = await storage.getFamily(familyId);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      if (isHeadOrDualRole(req.user, family) && family.userId !== req.user.id) {
        return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
      }
      if (!family.wifeName) {
        return res.status(404).json({ message: "\u0627\u0644\u0632\u0648\u062C/\u0627\u0644\u0632\u0648\u062C\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F/\u0629" });
      }
      const { spouseName, spouseID, spouseBirthDate, spouseJob, spousePregnant } = req.body;
      const updatedFamily = await storage.updateFamily(familyId, {
        wifeName: spouseName !== void 0 ? spouseName : family.wifeName,
        wifeID: spouseID !== void 0 ? spouseID : family.wifeID,
        wifeBirthDate: spouseBirthDate !== void 0 ? spouseBirthDate : family.wifeBirthDate,
        wifeJob: spouseJob !== void 0 ? spouseJob : family.wifeJob,
        wifePregnant: spousePregnant !== void 0 ? spousePregnant : family.wifePregnant
      });
      if (!updatedFamily) return res.status(404).json({ message: "\u0627\u0644\u0632\u0648\u062C/\u0627\u0644\u0632\u0648\u062C\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F/\u0629" });
      const user = await storage.getUser(family.userId);
      const spouseData = getSpouseDataWithGenderLabel(updatedFamily, user?.gender || null);
      await storage.createLog({
        type: "spouse_update",
        message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0632\u0648\u062C/\u0627\u0644\u0632\u0648\u062C\u0629 \u0644\u0639\u0627\u0626\u0644\u0629 ${updatedFamily.husbandName} \u0645\u0646 \u0642\u0628\u0644 ${req.user.username}`,
        userId: req.user.id
      });
      res.json(spouseData);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.delete("/api/family/:familyId/spouse", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const family = await storage.getFamily(familyId);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      if (isHeadOrDualRole(req.user, family) && family.userId !== req.user.id) {
        return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643" });
      }
      if (!family.wifeName) return res.status(404).json({ message: "\u0627\u0644\u0632\u0648\u062C/\u0627\u0644\u0632\u0648\u062C\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F/\u0629" });
      const result = await db.update(families).set({
        wifeName: null,
        wifeID: null,
        wifeBirthDate: null,
        wifeJob: null,
        wifePregnant: false
      }).where(eq(families.id, familyId));
      if (result.rowCount === 0) return res.status(404).json({ message: "\u0627\u0644\u0632\u0648\u062C/\u0627\u0644\u0632\u0648\u062C\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F/\u0629" });
      res.sendStatus(204);
    } catch (error) {
      console.error("Server: Error deleting spouse:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/requests", authMiddleware, async (req, res) => {
    try {
      const family = await storage.getFamilyByUserId(req.user.id);
      if (isHeadOrDualRole(req.user, family)) {
        if (!family) return res.json([]);
        const requests2 = await storage.getRequestsByFamilyId(family.id);
        res.json(requests2);
      } else {
        const requestsWithFamily = await storage.getAllRequestsWithFamilies();
        res.json(requestsWithFamily);
      }
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/requests", authMiddleware, async (req, res) => {
    try {
      let requestData;
      const family = await storage.getFamilyByUserId(req.user.id);
      if (isHeadOrDualRole(req.user, family)) {
        const requestDataSchema = insertRequestSchema.omit({ familyId: true });
        requestData = requestDataSchema.parse(req.body);
        if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
        requestData = { ...requestData, familyId: family.id };
      } else {
        requestData = insertRequestSchema.parse(req.body);
      }
      const request = await storage.createRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.put("/api/requests/:id", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const requestData = insertRequestSchema.partial().parse(req.body);
      const originalRequest = await storage.getRequest(id);
      if (!originalRequest) return res.status(404).json({ message: "\u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      const request = await storage.updateRequest(id, requestData);
      if (!request) return res.status(404).json({ message: "\u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      const statusChanged = originalRequest.status !== request.status;
      const commentAdded = !originalRequest.adminComment && request.adminComment;
      const commentChanged = originalRequest.adminComment !== request.adminComment;
      const family = await getFamilyByIdOrDualRole(request.familyId);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      console.log("[Notification Debug]", {
        requestId: request.id,
        familyId: request.familyId,
        familyUserId: family.userId,
        action: statusChanged ? "statusChanged" : commentAdded || commentChanged ? "comment" : "none",
        notificationRecipients: [family.userId]
      });
      if (statusChanged) {
        const statusText = request.status === "approved" ? "\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629" : request.status === "rejected" ? "\u062A\u0645 \u0627\u0644\u0631\u0641\u0636" : "\u062A\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B";
        await storage.createNotification({
          title: `\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 #${request.id}`,
          message: `\u062A\u0645 ${statusText} \u0639\u0644\u0649 \u0637\u0644\u0628\u0643 \u0645\u0646 \u0646\u0648\u0639 "${getRequestTypeInArabic(request.type)}". ${request.adminComment ? `\u0627\u0644\u062A\u0639\u0644\u064A\u0642: ${request.adminComment}` : ""}`,
          target: "specific",
          recipients: [family.userId]
        });
      } else if (commentAdded || commentChanged) {
        await storage.createNotification({
          title: `\u062A\u0639\u0644\u064A\u0642 \u0625\u062F\u0627\u0631\u064A \u0639\u0644\u0649 \u0627\u0644\u0637\u0644\u0628 #${request.id}`,
          message: `\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u062A\u0639\u0644\u064A\u0642 \u0625\u062F\u0627\u0631\u064A \u0639\u0644\u0649 \u0637\u0644\u0628\u0643 \u0645\u0646 \u0646\u0648\u0639 "${getRequestTypeInArabic(request.type)}": ${request.adminComment}`,
          target: "specific",
          recipients: [family.userId]
        });
      }
      res.json(request);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/notifications", authMiddleware, async (req, res) => {
    try {
      let notifications2 = await storage.getAllNotifications();
      if (req.user.role === "head") {
        notifications2 = notifications2.filter(
          (n) => n.target === "all" || n.target === "head" || n.target === "urgent" || n.target === "specific" && Array.isArray(n.recipients) && n.recipients.includes(req.user.id)
        );
      }
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/notifications", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      let notificationData = insertNotificationSchema.parse(req.body);
      if (notificationData.target === "admin") {
        const admins = await storage.getAllUsers?.() || [];
        const adminIds = admins.filter((u) => u.role === "admin").map((u) => u.id);
        notificationData = {
          ...notificationData,
          recipients: adminIds
        };
      }
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/admin/families", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      const families3 = await storage.getAllFamiliesWithMembersOptimized();
      const familiesWithGenderAppropriateSpouse = await Promise.all(families3.map(async (family) => {
        const user = await storage.getUser(family.userId);
        const spouse = family.wifeName ? getSpouseDataWithGenderLabel(family, user?.gender || null) : null;
        return { ...family, spouse, userGender: user?.gender };
      }));
      res.json(familiesWithGenderAppropriateSpouse);
    } catch (error) {
      console.error("Families endpoint error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/admin/families/:id", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const family = await getFamilyByIdOrDualRole(id);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      const user = await storage.getUser(family.userId);
      const spouse = family.wifeName ? getSpouseDataWithGenderLabel(family, user?.gender || null) : null;
      const members2 = await storage.getMembersByFamilyId(family.id);
      const orphans3 = await storage.getOrphansByFamilyId(family.id);
      const requests2 = await storage.getRequestsByFamilyId(family.id);
      res.json({ ...family, spouse, members: members2, orphans: orphans3, requests: requests2, userGender: user?.gender });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.put("/api/admin/families/:id", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const familyData = insertFamilySchema.partial().parse(req.body);
      const family = await getFamilyByIdOrDualRole(id);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      const updatedFamily = await storage.updateFamily(id, familyData);
      if (!updatedFamily) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      await storage.createLog({
        type: "admin_family_update",
        message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0639\u0627\u0626\u0644\u0629 ${updatedFamily.husbandName} \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0634\u0631\u0641 ${req.user.username}`,
        userId: req.user.id
      });
      res.json(updatedFamily);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.delete("/api/admin/families/:id", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const family = await storage.getFamily(id);
      const success = await storage.deleteFamily(id);
      if (!success) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      await storage.createLog({
        type: "family_deletion",
        message: `\u062A\u0645 \u062D\u0630\u0641 \u0639\u0627\u0626\u0644\u0629 ${id} (\u0631\u0628 \u0627\u0644\u0623\u0633\u0631\u0629: ${family?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}) \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0634\u0631\u0641 ${req.user.username}`,
        userId: req.user.id
      });
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/admin/orphans", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      const orphans3 = await storage.getAllOrphans();
      const orphansWithFamily = await Promise.all(orphans3.map(async (orphan) => {
        try {
          const family = await storage.getFamily(orphan.familyId);
          const orphansUnder18Count = await storage.getOrphansCountUnder18ByFamilyId(orphan.familyId);
          return {
            ...orphan,
            family: family ? {
              husbandName: family.husbandName,
              husbandID: family.husbandID,
              primaryPhone: family.primaryPhone
            } : null,
            orphansUnder18Count
          };
        } catch (familyError) {
          console.error(`Error getting family for orphan ${orphan.id} with familyId ${orphan.familyId}:`, familyError);
          const orphansUnder18Count = await storage.getOrphansCountUnder18ByFamilyId(orphan.familyId);
          return {
            ...orphan,
            family: null,
            orphansUnder18Count
          };
        }
      }));
      res.json(orphansWithFamily);
    } catch (error) {
      console.error("Admin orphans endpoint error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/admin/orphans", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      const orphanData = insertOrphanSchema.parse(req.body);
      const orphan = await storage.createOrphan(orphanData);
      const family = await storage.getFamily(orphan.familyId);
      await storage.createLog({
        type: "admin_orphan_creation",
        message: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u064A\u062A\u064A\u0645 \u062C\u062F\u064A\u062F \u0641\u064A \u0639\u0627\u0626\u0644\u0629 ${family?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0634\u0631\u0641 ${req.user.username}`,
        userId: req.user.id
      });
      res.status(201).json(orphan);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.put("/api/admin/orphans/:id", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const orphanData = insertOrphanSchema.partial().parse(req.body);
      const orphan = await storage.updateOrphan(id, orphanData);
      if (!orphan) return res.status(404).json({ message: "\u0627\u0644\u064A\u062A\u064A\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      const family = await storage.getFamily(orphan.familyId);
      await storage.createLog({
        type: "admin_orphan_update",
        message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u064A\u062A\u064A\u0645 ${orphan.orphanName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0641\u064A \u0639\u0627\u0626\u0644\u0629 ${family?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0634\u0631\u0641 ${req.user.username}`,
        userId: req.user.id
      });
      res.json(orphan);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/admin/orphans/upload", authMiddleware, upload.single("image"), async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      if (!req.file) {
        return res.status(400).json({ message: "\u0644\u0645 \u064A\u062A\u0645 \u062A\u062D\u0645\u064A\u0644 \u0623\u064A \u0635\u0648\u0631\u0629" });
      }
      const imageBuffer = req.file.buffer;
      const imageBase64 = `data:${req.file.mimetype};base64,${imageBuffer.toString("base64")}`;
      res.json({ image: imageBase64 });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0635\u0648\u0631\u0629" });
    }
  });
  app2.delete("/api/admin/orphans/:id", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const orphan = await storage.getOrphan(id);
      const success = await storage.deleteOrphan(id);
      if (!success) return res.status(404).json({ message: "\u0627\u0644\u064A\u062A\u064A\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      await storage.createLog({
        type: "admin_orphan_deletion",
        message: `\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u064A\u062A\u064A\u0645 ${orphan?.orphanName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} (ID: ${orphan?.id}) \u0641\u064A \u0627\u0644\u0639\u0627\u0626\u0644\u0629 ${orphan?.familyId} \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0634\u0631\u0641 ${req.user.username}`,
        userId: req.user.id
      });
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/admin/families/:id/members", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      const familyId = parseInt(req.params.id);
      const family = await getFamilyByIdOrDualRole(familyId);
      if (!family) return res.status(404).json({ message: "\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      const memberData = { ...insertMemberSchema.omit({ familyId: true }).parse(req.body), familyId };
      const member = await storage.createMember(memberData);
      const memberFamily = await storage.getFamily(member.familyId);
      await storage.createLog({
        type: "admin_member_creation",
        message: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0641\u0631\u062F \u062C\u062F\u064A\u062F ${member.fullName} \u0641\u064A \u0639\u0627\u0626\u0644\u0629 ${memberFamily?.husbandName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"} \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0634\u0631\u0641 ${req.user.username}`,
        userId: req.user.id
      });
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/register-family", async (req, res) => {
    try {
      const { user: userData, family: familyData, members: membersData } = req.body;
      const existingUser = await storage.getUserByNationalId(familyData.husbandID);
      if (existingUser) {
        return res.status(400).json({ message: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629 \u0645\u0633\u062C\u0644 \u0645\u0633\u0628\u0642\u0627\u064B" });
      }
      const user = await storage.createUser({
        username: familyData.husbandID,
        password: userData.password ? await hashPassword(userData.password) : await hashPassword(familyData.husbandID),
        role: "head",
        gender: userData.gender || "male",
        // Add gender field, default to 'male' for backward compatibility
        phone: familyData.primaryPhone
      });
      const family = await storage.createFamily({
        ...familyData,
        userId: user.id
      });
      if (membersData && membersData.length > 0) {
        for (const memberData of membersData) {
          await storage.createMember({
            ...memberData,
            familyId: family.id
          });
        }
      }
      if (userData.password) {
        try {
          const { generateToken: generateToken2 } = await Promise.resolve().then(() => (init_jwt_auth(), jwt_auth_exports));
          const token = generateToken2(user);
          res.status(201).json({ token, user, family });
        } catch (err) {
          console.error("Token generation error:", err);
          return res.status(500).json({ message: "\u062A\u0645 \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0628\u0646\u062C\u0627\u062D \u0644\u0643\u0646 \u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" });
        }
      } else {
        res.status(201).json({ user, family });
      }
    } catch (error) {
      if (error.code === "23505") {
        return res.status(400).json({ message: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629 \u0645\u0633\u062C\u0644 \u0645\u0633\u0628\u0642\u0627\u064B" });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.put("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const { gender } = req.body;
      if (gender && !["male", "female", "other"].includes(gender)) {
        return res.status(400).json({ message: "\u0627\u0644\u062C\u0646\u0633 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D" });
      }
      const user = await storage.updateUser(req.user.id, { gender });
      if (!user) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/user/password", authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u062C\u062F\u064A\u062F\u0629" });
    }
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      const valid = await comparePasswords(currentPassword, user.password);
      if (!valid) {
        return res.status(400).json({ message: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
      }
      const hashed = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashed });
      res.json({ message: "\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" });
    }
  });
  app2.get("/api/admin/users", authMiddleware, async (req, res) => {
    if (req.user.role === "head") return res.sendStatus(403);
    try {
      const users2 = await storage.getAllUsers({ includeDeleted: true });
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/admin/users", authMiddleware, async (req, res) => {
    if (req.user.role !== "root") return res.sendStatus(403);
    try {
      let userData = req.body;
      if (userData.password) {
        const settings2 = await storage.getAllSettings();
        const settingsMap = Object.fromEntries(settings2.map((s) => [s.key, s.value]));
        const minLength = parseInt(settingsMap.minPasswordLength || "8");
        const requireUppercase = settingsMap.requireUppercase === "true";
        const requireLowercase = settingsMap.requireLowercase === "true";
        const requireNumbers = settingsMap.requireNumbers === "true";
        const requireSpecialChars = settingsMap.requireSpecialChars === "true";
        const errors = [];
        if (userData.password.length < minLength) {
          errors.push(`\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 ${minLength} \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644`);
        }
        if (requireUppercase && !/[A-Z]/.test(userData.password)) {
          errors.push("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u062D\u0631\u0641 \u0643\u0628\u064A\u0631 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644");
        }
        if (requireLowercase && !/[a-z]/.test(userData.password)) {
          errors.push("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u062D\u0631\u0641 \u0635\u063A\u064A\u0631 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644");
        }
        if (requireNumbers && !/\d/.test(userData.password)) {
          errors.push("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0631\u0642\u0645 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644");
        }
        if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(userData.password)) {
          errors.push("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0631\u0645\u0632 \u062E\u0627\u0635 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644");
        }
        if (errors.length > 0) {
          return res.status(400).json({ message: errors.join("\u060C ") });
        }
        userData.password = await hashPassword(userData.password);
      }
      const allowedFields = ["username", "password", "role", "phone", "gender", "isProtected", "identityId"];
      userData = Object.fromEntries(Object.entries(userData).filter(([k]) => allowedFields.includes(k)));
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.put("/api/admin/users/:id", authMiddleware, async (req, res) => {
    if (req.user.role !== "root" && req.user.role !== "admin") return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      let userData = req.body;
      const targetUser = await storage.getUser(id);
      if (!targetUser) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      if (req.user.role === "root") {
        if (!userData.username) {
          userData.username = targetUser.username;
        }
        const updatedUser = await storage.updateUser(id, userData);
        if (!updatedUser) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        return res.json(updatedUser);
      }
      if (req.user.role === "admin") {
        if (targetUser.role === "root") {
          return res.status(403).json({ message: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0631\u0626\u064A\u0633\u064A." });
        }
        if (targetUser.role === "admin" && targetUser.isProtected) {
          return res.status(403).json({ message: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u062A\u0639\u062F\u064A\u0644 \u0645\u0634\u0631\u0641 \u0645\u062D\u0645\u064A." });
        }
        if (req.user.isProtected) {
          if (targetUser.role === "admin" && !targetUser.isProtected) {
          } else if (targetUser.role === "head") {
          } else {
            return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u062A\u0639\u062F\u064A\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645." });
          }
        } else {
          if (targetUser.role !== "head" && !(targetUser.role === "admin" && !targetUser.isProtected)) {
            return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u062A\u0639\u062F\u064A\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645." });
          }
        }
        if ("isProtected" in userData) {
          delete userData.isProtected;
        }
        userData.role = targetUser.role;
        if (!userData.username) {
          userData.username = targetUser.username;
        }
        const updatedUser = await storage.updateUser(id, userData);
        if (!updatedUser) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        return res.json(updatedUser);
      }
      return res.sendStatus(403);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.delete("/api/admin/users/:id", authMiddleware, async (req, res) => {
    if (req.user.role !== "root" && req.user.role !== "admin") return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const targetUser = await storage.getUser(id);
      if (!targetUser) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      const families3 = await storage.getFamiliesByUserId(id);
      const hasFamilies = families3 && families3.length > 0;
      const cascade = req.query.cascade === "true";
      const hard = req.query.hard === "true";
      if (hasFamilies && !cascade) {
        return res.status(409).json({
          message: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u0623\u0646\u0647 \u0645\u0631\u062A\u0628\u0637 \u0628\u0639\u0627\u0626\u0644\u0627\u062A. \u064A\u0645\u0643\u0646\u0643 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u062D\u0630\u0641 \u0627\u0644\u0645\u062A\u0633\u0644\u0633\u0644 \u0644\u062D\u0630\u0641 \u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0627\u0626\u0644\u0627\u062A \u0648\u0627\u0644\u0623\u0641\u0631\u0627\u062F \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u064A\u0646 \u0628\u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645.",
          code: "USER_REFERENCED_IN_FAMILY",
          families: families3.map((f) => ({ id: f.id, husbandName: f.husbandName, husbandID: f.husbandID }))
        });
      }
      if (req.user.role === "root") {
        if (targetUser.id === req.user.id) {
          return res.status(403).json({ message: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u062E\u0627\u0635" });
        }
        if (hasFamilies && cascade) {
          for (const family of families3) {
            await storage.deleteFamily(family.id);
          }
        }
        const success = hard ? await storage.deleteUser(id) : await storage.softDeleteUser(id);
        if (!success) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        return res.sendStatus(204);
      }
      if (req.user.role === "admin") {
        if (targetUser.role === "root") {
          return res.status(403).json({ message: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u062D\u0630\u0641 \u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0631\u0626\u064A\u0633\u064A." });
        }
        if (targetUser.role === "admin" && targetUser.isProtected) {
          return res.status(403).json({ message: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u062D\u0630\u0641 \u0645\u0634\u0631\u0641 \u0645\u062D\u0645\u064A." });
        }
        if (req.user.isProtected) {
          if (targetUser.role === "admin" && !targetUser.isProtected) {
          } else if (targetUser.role === "head") {
          } else {
            return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645." });
          }
        } else {
          if (targetUser.role !== "head" && !(targetUser.role === "admin" && !targetUser.isProtected)) {
            return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645." });
          }
        }
        if (hasFamilies && cascade) {
          for (const family of families3) {
            await storage.deleteFamily(family.id);
          }
        }
        const success = hard ? await storage.deleteUser(id) : await storage.softDeleteUser(id);
        if (!success) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        return res.sendStatus(204);
      }
      return res.sendStatus(403);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.delete("/api/admin/heads", authMiddleware, async (req, res) => {
    if (req.user.role !== "root" && req.user.role !== "admin") return res.sendStatus(403);
    try {
      if (req.user.role === "admin" && !req.user.isProtected) {
        return res.status(403).json({ message: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0634\u0631\u0641 \u063A\u064A\u0631 \u0627\u0644\u0645\u062D\u0645\u064A \u062D\u0630\u0641 \u0643\u0644 \u0631\u0624\u0648\u0633 \u0627\u0644\u0639\u0627\u0626\u0644\u0627\u062A" });
      }
      await storage.clearHeads();
      res.json({ message: "\u062A\u0645 \u062D\u0630\u0641 \u062C\u0645\u064A\u0639 \u0631\u0624\u0648\u0633 \u0627\u0644\u0639\u0627\u0626\u0644\u0627\u062A \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      console.error("Error deleting all heads:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0630\u0641 \u0627\u0644\u062C\u0645\u0627\u0639\u064A \u0644\u0631\u0624\u0648\u0633 \u0627\u0644\u0639\u0627\u0626\u0644\u0627\u062A" });
    }
  });
  app2.post("/api/admin/users/:id/reset-lockout", authMiddleware, async (req, res) => {
    if (req.user.role !== "root" && req.user.role !== "admin") return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const targetUser = await storage.getUser(id);
      if (!targetUser) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      if (req.user.role === "root") {
        await storage.updateUser(id, {
          failedLoginAttempts: 0,
          lockoutUntil: null
        });
        return res.json({ message: "\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u062D\u0638\u0631 \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0646\u062C\u0627\u062D" });
      }
      if (req.user.role === "admin") {
        if (targetUser.role === "root") {
          return res.status(403).json({ message: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u062D\u0638\u0631 \u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0631\u0626\u064A\u0633\u064A." });
        }
        if (targetUser.role === "admin" && targetUser.isProtected) {
          return res.status(403).json({ message: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u062D\u0638\u0631 \u0645\u0634\u0631\u0641 \u0645\u062D\u0645\u064A." });
        }
        if (targetUser.role !== "head" && !(targetUser.role === "admin" && !targetUser.isProtected)) {
          return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u062D\u0638\u0631 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645." });
        }
        await storage.updateUser(id, {
          failedLoginAttempts: 0,
          lockoutUntil: null
        });
        return res.json({ message: "\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u062D\u0638\u0631 \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0646\u062C\u0627\u062D" });
      }
      return res.sendStatus(403);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/admin/users/:id/restore", authMiddleware, async (req, res) => {
    if (req.user.role !== "root") return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id, { includeDeleted: true });
      if (!user || !user.deletedAt) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u063A\u064A\u0631 \u0645\u062D\u0630\u0648\u0641" });
      const success = await storage.restoreUser(id);
      if (!success) return res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u0627\u0633\u062A\u0639\u0627\u062F\u0629" });
      res.json({ message: "\u062A\u0645 \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/admin/logs", authMiddleware, async (req, res) => {
    if (req.user.role !== "root" && req.user.role !== "admin") return res.sendStatus(403);
    try {
      const { page = 1, pageSize = 20, type, userId, search } = req.query;
      const limit = Math.max(1, Math.min(Number(pageSize) || 20, 100));
      const offset = (Number(page) - 1) * limit;
      const logs2 = await storage.getLogs({
        type,
        userId: userId ? Number(userId) : void 0,
        search,
        limit,
        offset
      });
      const usersMap = Object.fromEntries((await storage.getAllUsers()).map((u) => [u.id, u]));
      const logsWithUser = logs2.map((log) => ({ ...log, user: usersMap[log.userId] || null }));
      res.json(logsWithUser);
    } catch (error) {
      console.error("Error in GET /api/admin/logs:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/admin/logs", authMiddleware, async (req, res) => {
    if (req.user.role !== "root" && req.user.role !== "admin") return res.sendStatus(403);
    try {
      const logData = req.body;
      logData.userId = req.user.id;
      const log = await storage.createLog(logData);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/settings", authMiddleware, async (req, res) => {
    try {
      const allSettings = await storage.getAllSettings();
      const settingsMap = Object.fromEntries(allSettings.map((s) => [s.key, s.value]));
      res.json(settingsMap);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/public/settings", async (req, res) => {
    try {
      const allSettings = await storage.getAllSettings();
      const settingsMap = Object.fromEntries(allSettings.map((s) => [s.key, s.value]));
      res.json(settingsMap);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/settings", authMiddleware, async (req, res) => {
    if (req.user.role !== "root") return res.sendStatus(403);
    try {
      const { key, value, description } = req.body;
      if (!key || value === void 0) {
        return res.status(400).json({ message: "\u0627\u0644\u0645\u0641\u062A\u0627\u062D \u0648\u0627\u0644\u0642\u064A\u0645\u0629 \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
      }
      await storage.setSetting(key, value, description);
      res.json({ message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/settings/bulk", authMiddleware, async (req, res) => {
    if (req.user.role !== "root") return res.sendStatus(403);
    try {
      const { settings: settings2 } = req.body;
      if (!settings2 || typeof settings2 !== "object") {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0645\u0637\u0644\u0648\u0628\u0629" });
      }
      const failures = [];
      let successCount = 0;
      for (const [key, value] of Object.entries(settings2)) {
        try {
          let description = "";
          switch (key) {
            case "siteName":
              description = "\u0627\u0633\u0645 \u0627\u0644\u0645\u0648\u0642\u0639/\u0627\u0644\u062A\u0637\u0628\u064A\u0642";
              break;
            case "siteTitle":
              description = "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0648\u0642\u0639";
              break;
            case "authPageTitle":
              description = "\u0639\u0646\u0648\u0627\u0646 \u0635\u0641\u062D\u0629 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644";
              break;
            case "authPageSubtitle":
              description = "\u0648\u0635\u0641 \u0635\u0641\u062D\u0629 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644";
              break;
            case "siteLogo":
              description = "\u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u0648\u0642\u0639";
              break;
            case "authPageIcon":
              description = "\u0623\u064A\u0642\u0648\u0646\u0629 \u0635\u0641\u062D\u0629 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644";
              break;
            case "primaryColor":
              description = "\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0623\u0633\u0627\u0633\u064A";
              break;
            case "secondaryColor":
              description = "\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u062B\u0627\u0646\u0648\u064A";
              break;
            case "themeMode":
              description = "\u0646\u0645\u0637 \u0627\u0644\u0645\u0638\u0647\u0631";
              break;
            case "fontFamily":
              description = "\u0646\u0648\u0639 \u0627\u0644\u062E\u0637";
              break;
            case "minPasswordLength":
              description = "\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0637\u0648\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631";
              break;
            case "requireUppercase":
              description = "\u062A\u0637\u0644\u0628 \u0623\u062D\u0631\u0641 \u0643\u0628\u064A\u0631\u0629";
              break;
            case "requireLowercase":
              description = "\u062A\u0637\u0644\u0628 \u0623\u062D\u0631\u0641 \u0635\u063A\u064A\u0631\u0629";
              break;
            case "requireNumbers":
              description = "\u062A\u0637\u0644\u0628 \u0623\u0631\u0642\u0627\u0645";
              break;
            case "requireSpecialChars":
              description = "\u062A\u0637\u0644\u0628 \u0631\u0645\u0648\u0632 \u062E\u0627\u0635\u0629";
              break;
            case "maxLoginAttempts":
              description = "\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644";
              break;
            case "lockoutDuration":
              description = "\u0645\u062F\u0629 \u0627\u0644\u062D\u0638\u0631 \u0628\u0627\u0644\u062F\u0642\u0627\u0626\u0642";
              break;
            case "sessionTimeout":
              description = "\u0645\u062F\u0629 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0627\u0644\u062F\u0642\u0627\u0626\u0642";
              break;
            default:
              description = key;
          }
          await storage.setSetting(key, value, description);
          successCount++;
        } catch (settingError) {
          failures.push({ key, error: settingError.message });
        }
      }
      storage.clearSettingsCache();
      if (failures.length === 0) {
        res.json({ message: `\u062A\u0645 \u062D\u0641\u0638 \u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0628\u0646\u062C\u0627\u062D (${successCount} \u0625\u0639\u062F\u0627\u062F)` });
      } else {
        res.status(207).json({
          message: `\u062A\u0645 \u062D\u0641\u0638 ${successCount} \u0625\u0639\u062F\u0627\u062F \u0628\u0646\u062C\u0627\u062D\u060C \u0641\u0634\u0644 \u0641\u064A \u062D\u0641\u0638 ${failures.length} \u0625\u0639\u062F\u0627\u062F`,
          failures
        });
      }
    } catch (error) {
      console.error("Bulk settings save error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/settings/:key", authMiddleware, async (req, res) => {
    try {
      const value = await storage.getSetting(req.params.key);
      if (value === void 0) {
        return res.status(404).json({ message: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      res.json({ value });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/settings/maintenance", async (req, res) => {
    try {
      const value = await storage.getSetting("maintenance");
      res.json({ enabled: value === "true" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/settings/maintenance", authMiddleware, async (req, res) => {
    if (req.user.role !== "root") return res.sendStatus(403);
    try {
      const { enabled } = req.body;
      await storage.setSetting("maintenance", enabled ? "true" : "false", "\u0648\u0636\u0639 \u0627\u0644\u0635\u064A\u0627\u0646\u0629");
      res.json({ message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0648\u0636\u0639 \u0627\u0644\u0635\u064A\u0627\u0646\u0629" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/version", async (req, res) => {
    try {
      const pkg = await Promise.resolve().then(() => __toESM(require_package(), 1));
      res.json({ version: pkg.default.version });
    } catch (error) {
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0625\u0635\u062F\u0627\u0631" });
    }
  });
  app2.post("/api/change-password", authMiddleware, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0645\u0637\u0644\u0648\u0628\u0629" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user || !await comparePasswords(currentPassword, user.password)) {
        return res.status(400).json({ message: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
      }
      const settings2 = await storage.getAllSettings();
      const settingsMap = Object.fromEntries(settings2.map((s) => [s.key, s.value]));
      const minLength = parseInt(settingsMap.minPasswordLength || "8");
      const requireUppercase = settingsMap.requireUppercase === "true";
      const requireLowercase = settingsMap.requireLowercase === "true";
      const requireNumbers = settingsMap.requireNumbers === "true";
      const requireSpecialChars = settingsMap.requireSpecialChars === "true";
      const errors = [];
      if (newPassword.length < minLength) {
        errors.push(`\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 ${minLength} \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644`);
      }
      if (requireUppercase && !/[A-Z]/.test(newPassword)) {
        errors.push("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u062D\u0631\u0641 \u0643\u0628\u064A\u0631 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644");
      }
      if (requireLowercase && !/[a-z]/.test(newPassword)) {
        errors.push("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u062D\u0631\u0641 \u0635\u063A\u064A\u0631 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644");
      }
      if (requireNumbers && !/\d/.test(newPassword)) {
        errors.push("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0631\u0642\u0645 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644");
      }
      if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
        errors.push("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0631\u0645\u0632 \u062E\u0627\u0635 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644");
      }
      if (errors.length > 0) {
        return res.status(400).json({ message: errors.join("\u060C ") });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(req.user.id, hashedPassword);
      res.json({ message: "\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" });
    }
  });
  app2.get("/api/admin/backup", authMiddleware, async (req, res) => {
    if (req.user.role !== "root") return res.sendStatus(403);
    try {
      console.log("Starting database backup...");
      res.setHeader("Content-Disposition", `attachment; filename=backup-${Date.now()}.json`);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      res.write("{\n");
      let isFirst = true;
      const writeSection = (key, data) => {
        if (!isFirst) res.write(",\n");
        res.write(`  "${key}": ${JSON.stringify(data, null, 2)}`);
        isFirst = false;
      };
      console.log("\u{1F4CA} Backing up users...");
      const users2 = await storage.getAllUsers();
      writeSection("users", users2);
      console.log(`\u2705 Users: ${users2.length} records`);
      console.log("\u{1F4CA} Backing up families...");
      const families3 = await storage.getAllFamilies();
      writeSection("families", families3);
      console.log(`\u2705 Families: ${families3.length} records`);
      console.log("\u{1F4CA} Backing up members...");
      const allMembers = [];
      const BATCH_SIZE = 1e3;
      let offset = 0;
      let memberBatch;
      do {
        memberBatch = await db.select().from(members).limit(BATCH_SIZE).offset(offset);
        allMembers.push(...memberBatch);
        offset += BATCH_SIZE;
        console.log(`\u{1F4CA} Loaded ${allMembers.length} members so far...`);
      } while (memberBatch.length === BATCH_SIZE);
      writeSection("members", allMembers);
      console.log(`\u2705 Members: ${allMembers.length} records`);
      console.log("\u{1F4CA} Backing up requests...");
      const requests2 = await storage.getAllRequests();
      writeSection("requests", requests2);
      console.log(`\u2705 Requests: ${requests2.length} records`);
      console.log("\u{1F4CA} Backing up notifications...");
      const notifications2 = await storage.getAllNotifications();
      writeSection("notifications", notifications2);
      console.log(`\u2705 Notifications: ${notifications2.length} records`);
      console.log("\u{1F4CA} Backing up settings...");
      const settings2 = await storage.getAllSettings();
      writeSection("settings", settings2);
      console.log(`\u2705 Settings: ${settings2.length} records`);
      console.log("\u{1F4CA} Backing up logs...");
      const logs2 = await storage.getLogs({ limit: 1e4 });
      writeSection("logs", logs2);
      console.log(`\u2705 Logs: ${logs2.length} records`);
      res.write("\n}");
      res.end();
      console.log(`\u2705 Backup completed successfully: ${families3.length} families, ${allMembers.length} members, ${requests2.length} requests`);
    } catch (e) {
      console.error("Backup creation error:", e);
      if (!res.headersSent) {
        res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629" });
      } else {
        res.end();
      }
    }
  });
  app2.post("/api/admin/restore", authMiddleware, upload.single("backup"), async (req, res) => {
    if (req.user.role !== "root") return res.sendStatus(403);
    try {
      if (!req.file) return res.status(400).json({ message: "\u064A\u0631\u062C\u0649 \u0631\u0641\u0639 \u0645\u0644\u0641 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629" });
      const data = JSON.parse(req.file.buffer.toString());
      await storage.clearLogs();
      await storage.clearNotifications();
      await storage.clearRequests();
      await storage.clearMembers();
      await storage.clearFamilies();
      await storage.clearUsers();
      await storage.clearSettings();
      for (const s of data.settings || []) await storage.setSetting(s.key, s.value, s.description);
      for (const u of data.users || []) await storage.createUser(u);
      for (const f of data.families || []) await storage.createFamily(f);
      for (const m of data.members || []) await storage.createMember(m);
      for (const r of data.requests || []) await storage.createRequest(r);
      for (const n of data.notifications || []) await storage.createNotification(n);
      for (const l of data.logs || []) await storage.createLog(l);
      res.json({ message: "\u062A\u0645\u062A \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D" });
    } catch (e) {
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629" });
    }
  });
  app2.post("/api/admin/merge", authMiddleware, async (req, res) => {
    if (req.user.role !== "root") return res.sendStatus(403);
    try {
      const { url } = req.body;
      const remoteUrl = url || process.env.DATABASE_URL;
      if (!remoteUrl) return res.status(400).json({ message: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0627\u0628\u0637 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0623\u0648 \u0636\u0628\u0637\u0647 \u0641\u064A \u0627\u0644\u0628\u064A\u0626\u0629" });
      const { Pool: Pool2 } = pg2;
      const remotePool = new Pool2({ connectionString: remoteUrl, ssl: { rejectUnauthorized: false } });
      const remoteDb = { query: (...args) => remotePool.query(...args) };
      async function fetchAll(table) {
        const { rows } = await remoteDb.query(`SELECT * FROM ${table}`);
        return rows;
      }
      const remote = {
        users: await fetchAll("users"),
        families: await fetchAll("families"),
        members: await fetchAll("members"),
        requests: await fetchAll("requests"),
        notifications: await fetchAll("notifications"),
        settings: await fetchAll("settings"),
        logs: await fetchAll("logs")
      };
      let inserted = 0, updated = 0, skipped = 0;
      console.log("\u{1F4CA} Starting optimized merge process...");
      console.log("\u{1F4CA} Loading local data...");
      const [localUsers, localFamilies, localMembers, localRequests, localNotifications, localSettings, localLogs] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllFamilies(),
        db.select().from(members),
        // Direct query for efficiency
        storage.getAllRequests(),
        storage.getAllNotifications(),
        storage.getAllSettings(),
        storage.getLogs({})
      ]);
      const localUserMap = new Map(localUsers.map((u) => [u.id, u]));
      const localFamilyMap = new Map(localFamilies.map((f) => [f.id, f]));
      const localMemberMap = new Map(localMembers.map((m) => [m.id, m]));
      const localRequestMap = new Map(localRequests.map((r) => [r.id, r]));
      const localNotificationMap = new Map(localNotifications.map((n) => [n.id, n]));
      const localSettingsMap = new Map(localSettings.map((s) => [s.key, s]));
      const localLogMap = new Map(localLogs.map((l) => [l.id, l]));
      console.log("\u{1F4CA} Processing users in batches...");
      const userOperations = { toInsert: [], toUpdate: [] };
      for (const r of remote.users) {
        const local = localUserMap.get(r.id);
        if (!local) {
          userOperations.toInsert.push(r);
        } else if (r.updatedAt && local.updatedAt && new Date(r.updatedAt) > new Date(local.updatedAt)) {
          userOperations.toUpdate.push(r);
        } else {
          skipped++;
        }
      }
      if (userOperations.toInsert.length > 0) {
        console.log(`\u{1F4CA} Inserting ${userOperations.toInsert.length} users...`);
        for (const user of userOperations.toInsert) {
          await storage.createUser(user);
          inserted++;
        }
      }
      if (userOperations.toUpdate.length > 0) {
        console.log(`\u{1F4CA} Updating ${userOperations.toUpdate.length} users...`);
        for (const user of userOperations.toUpdate) {
          await storage.updateUser(user.id, user);
          updated++;
        }
      }
      console.log("\u{1F4CA} Processing families in batches...");
      const familyOperations = { toInsert: [], toUpdate: [] };
      for (const r of remote.families) {
        const local = localFamilyMap.get(r.id);
        if (!local) {
          familyOperations.toInsert.push(r);
        } else if (r.updatedAt && local.updatedAt && new Date(r.updatedAt) > new Date(local.updatedAt)) {
          familyOperations.toUpdate.push(r);
        } else {
          skipped++;
        }
      }
      if (familyOperations.toInsert.length > 0) {
        console.log(`\u{1F4CA} Inserting ${familyOperations.toInsert.length} families...`);
        for (const family of familyOperations.toInsert) {
          await storage.createFamily(family);
          inserted++;
        }
      }
      if (familyOperations.toUpdate.length > 0) {
        console.log(`\u{1F4CA} Updating ${familyOperations.toUpdate.length} families...`);
        for (const family of familyOperations.toUpdate) {
          await storage.updateFamily(family.id, family);
          updated++;
        }
      }
      console.log("\u{1F4CA} Processing members in batches...");
      const memberOperations = { toInsert: [], toUpdate: [] };
      for (const r of remote.members) {
        const local = localMemberMap.get(r.id);
        if (!local) {
          memberOperations.toInsert.push(r);
        } else if (r.updatedAt && local.updatedAt && new Date(r.updatedAt) > new Date(local.updatedAt)) {
          memberOperations.toUpdate.push(r);
        } else {
          skipped++;
        }
      }
      if (memberOperations.toInsert.length > 0) {
        console.log(`\u{1F4CA} Inserting ${memberOperations.toInsert.length} members...`);
        for (const member of memberOperations.toInsert) {
          await storage.createMember(member);
          inserted++;
        }
      }
      if (memberOperations.toUpdate.length > 0) {
        console.log(`\u{1F4CA} Updating ${memberOperations.toUpdate.length} members...`);
        for (const member of memberOperations.toUpdate) {
          await storage.updateMember(member.id, member);
          updated++;
        }
      }
      console.log("\u{1F4CA} Processing requests in batches...");
      const requestOperations = { toInsert: [], toUpdate: [] };
      for (const r of remote.requests) {
        const local = localRequestMap.get(r.id);
        if (!local) {
          requestOperations.toInsert.push(r);
        } else if (r.updatedAt && local.updatedAt && new Date(r.updatedAt) > new Date(local.updatedAt)) {
          requestOperations.toUpdate.push(r);
        } else {
          skipped++;
        }
      }
      if (requestOperations.toInsert.length > 0) {
        console.log(`\u{1F4CA} Inserting ${requestOperations.toInsert.length} requests...`);
        for (const request of requestOperations.toInsert) {
          await storage.createRequest(request);
          inserted++;
        }
      }
      if (requestOperations.toUpdate.length > 0) {
        console.log(`\u{1F4CA} Updating ${requestOperations.toUpdate.length} requests...`);
        for (const request of requestOperations.toUpdate) {
          await storage.updateRequest(request.id, request);
          updated++;
        }
      }
      console.log("\u{1F4CA} Processing notifications...");
      for (const r of remote.notifications) {
        if (!localNotificationMap.has(r.id)) {
          await storage.createNotification(r);
          inserted++;
        } else {
          skipped++;
        }
      }
      console.log("\u{1F4CA} Processing settings...");
      for (const r of remote.settings) {
        if (!localSettingsMap.has(r.key)) {
          await storage.setSetting(r.key, r.value, r.description);
          inserted++;
        } else {
          skipped++;
        }
      }
      console.log("\u{1F4CA} Processing logs...");
      for (const r of remote.logs) {
        if (!localLogMap.has(r.id)) {
          await storage.createLog(r);
          inserted++;
        } else {
          skipped++;
        }
      }
      storage.clearSettingsCache();
      await remotePool.end();
      res.json({ message: `\u062A\u0645 \u0627\u0644\u062F\u0645\u062C: ${inserted} \u0645\u0636\u0627\u0641\u0629\u060C ${updated} \u0645\u062D\u062F\u062B\u0629\u060C ${skipped} \u0645\u062A\u0637\u0627\u0628\u0642\u0629.` });
    } catch (e) {
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062F\u0645\u062C \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A: " + e.message });
    }
  });
  app2.get("/api/users", authMiddleware, async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) return res.sendStatus(403);
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/support-vouchers", authMiddleware, async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) return res.sendStatus(403);
    try {
      const vouchers = await storage.getAllSupportVouchersOptimized();
      res.json(vouchers);
    } catch (error) {
      console.error("Support vouchers endpoint error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.get("/api/support-vouchers/:id", authMiddleware, async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) return res.sendStatus(403);
    try {
      const voucherId = parseInt(req.params.id);
      const voucher = await storage.getSupportVoucher(voucherId);
      if (!voucher) {
        return res.status(404).json({ message: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      const creator = await storage.getUser(voucher.createdBy);
      const recipients = await storage.getVoucherRecipientsOptimized(voucherId);
      const voucherWithDetails = {
        ...voucher,
        creator,
        recipients
      };
      res.json(voucherWithDetails);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/support-vouchers", authMiddleware, async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) return res.sendStatus(403);
    try {
      console.log("Received voucher data:", req.body);
      const createVoucherSchema = insertSupportVoucherSchema.omit({ createdBy: true });
      const voucherData = createVoucherSchema.parse(req.body);
      console.log("Parsed voucher data:", voucherData);
      const voucherToCreate = {
        ...voucherData,
        createdBy: req.user.id
      };
      const voucher = await storage.createSupportVoucher(voucherToCreate);
      res.status(201).json(voucher);
    } catch (error) {
      console.error("Error creating voucher:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.patch("/api/support-vouchers/:id", authMiddleware, async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) return res.sendStatus(403);
    try {
      const voucherId = parseInt(req.params.id);
      const { isActive } = req.body;
      const voucher = await storage.getSupportVoucher(voucherId);
      if (!voucher) {
        return res.status(404).json({ message: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      const updatedVoucher = await storage.updateSupportVoucher(voucherId, { isActive });
      res.json(updatedVoucher);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/support-vouchers/:id/recipients", authMiddleware, async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) return res.sendStatus(403);
    try {
      const voucherId = parseInt(req.params.id);
      const { familyIds } = req.body;
      if (!Array.isArray(familyIds)) {
        return res.status(400).json({ message: "\u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u0639\u0631\u0641\u0627\u062A \u0627\u0644\u0639\u0648\u0627\u0626\u0644 \u0645\u0635\u0641\u0648\u0641\u0629" });
      }
      const recipients = [];
      for (const familyId of familyIds) {
        const recipientData = {
          voucherId,
          familyId,
          status: "pending"
        };
        const recipient = await storage.createVoucherRecipient(recipientData);
        recipients.push(recipient);
      }
      res.status(201).json(recipients);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.post("/api/support-vouchers/:id/notify", authMiddleware, async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) return res.sendStatus(403);
    try {
      const voucherId = parseInt(req.params.id);
      const { recipientIds } = req.body;
      const voucher = await storage.getSupportVoucher(voucherId);
      if (!voucher) {
        return res.status(404).json({ message: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      const recipients = await storage.getVoucherRecipients(voucherId);
      const targetRecipients = recipientIds ? recipients.filter((r) => recipientIds.includes(r.id)) : recipients;
      for (const recipient of targetRecipients) {
        let message = `\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0643\u0648\u0628\u0648\u0646\u0629 \u062F\u0639\u0645 \u0627\u0644\u0649 \u0639\u0627\u0626\u0644\u062A\u0643 "${voucher.title}". \u064A\u0631\u062C\u0649 \u0627\u0644\u0630\u0647\u0627\u0628 \u0627\u0644\u0649 \u0645\u0643\u0627\u0646 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0643\u0648\u0628\u0648\u0646\u0629.`;
        if (voucher.location) {
          message += `

\u0645\u0648\u0642\u0639 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645: ${voucher.location}`;
        }
        const notification = {
          title: `\u0643\u0648\u0628\u0648\u0646\u0629 \u062F\u0639\u0645 \u062C\u062F\u064A\u062F: ${voucher.title}`,
          message,
          target: "specific",
          recipients: [recipient.familyId]
        };
        await storage.createNotification(notification);
        await storage.updateVoucherRecipient(recipient.id, {
          notified: true,
          notifiedAt: /* @__PURE__ */ new Date(),
          updatedBy: req.user.id
        });
      }
      res.json({ message: `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 ${targetRecipients.length} \u0625\u0634\u0639\u0627\u0631` });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  app2.patch("/api/voucher-recipients/:id", authMiddleware, async (req, res) => {
    if (!["admin", "root"].includes(req.user.role)) return res.sendStatus(403);
    try {
      const recipientId = parseInt(req.params.id);
      const { status, notes } = req.body;
      const updateData = { updatedBy: req.user.id };
      if (status) updateData.status = status;
      if (notes !== void 0) updateData.notes = notes;
      const recipient = await storage.updateVoucherRecipient(recipientId, updateData);
      if (!recipient) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u0644\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      res.json(recipient);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// netlify/functions/api.ts
import cors2 from "cors";
import serverless from "serverless-http";
var app = express();
app.use(cors2({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      console.log(logLine);
    }
  });
  next();
});
var serverInitialized = false;
var serverPromise;
var initializeServer = async () => {
  if (!serverInitialized) {
    serverPromise = registerRoutes(app);
    serverInitialized = true;
  }
  return serverPromise;
};
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});
var handler = async (event, context) => {
  await initializeServer();
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};
export {
  handler
};
