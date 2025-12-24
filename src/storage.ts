import {
  users, families, members, orphans, requests, notifications, documents, logs, settings, supportVouchers, voucherRecipients,
  type User, type InsertUser, type Family, type InsertFamily,
  type Member, type InsertMember, type Orphan, type InsertOrphan, type Request, type InsertRequest,
  type Notification, type InsertNotification, type Document, type InsertDocument,
  type Log, type InsertLog, type Settings, type InsertSettings,
  type SupportVoucher, type InsertSupportVoucher, type VoucherRecipient, type InsertVoucherRecipient
} from "./schema.js";
import { db } from "./db";
import { withRetry } from "./db-retry.js";
import { eq, desc, and, or, sql, isNull, isNotNull, inArray, count, max } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByNationalId(nationalId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByIds(ids: number[]): Promise<User[]>;
  restoreUser(id: number): Promise<boolean>;

  // Families
  getFamily(id: number): Promise<Family | undefined>;
  getFamilyByUserId(userId: number): Promise<Family | undefined>;
  createFamily(family: InsertFamily): Promise<Family>;
  updateFamily(id: number, family: Partial<InsertFamily>): Promise<Family | undefined>;
  getAllFamilies(branch?: string): Promise<Family[]>;
  getAllFamiliesWithMembersOptimized(): Promise<(Family & { members: Member[]; orphans: Orphan[] })[]>;
  getAllFamiliesWithMembersAndRequestsOptimized(branch?: string): Promise<(Family & { members: Member[]; orphans: Orphan[]; requests: Request[] })[]>;
  deleteFamily(id: number): Promise<boolean>;
  getFamiliesByUserId(userId: number): Promise<Family[]>;

  // Wife is now stored in families table
  getWifeByFamilyId(familyId: number): Promise<any | undefined>;
  getWife(id: number): Promise<any | undefined>;
  createWife(wife: any): Promise<any>;
  updateWife(id: number, wife: Partial<any>): Promise<any | undefined>;
  deleteWife(id: number): Promise<boolean>;

  // Members
  getMembersByFamilyId(familyId: number): Promise<Member[]>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: number): Promise<boolean>;
  getMember(id: number): Promise<Member | undefined>;

  // Orphans
  getOrphansByFamilyId(familyId: number): Promise<any[]>;
  getAllOrphans(): Promise<any[]>;
  getOrphansCountUnder18ByFamilyId(familyId: number): Promise<number>;
  createOrphan(orphan: any): Promise<any>;
  updateOrphan(id: number, orphan: Partial<any>): Promise<any | undefined>;
  deleteOrphan(id: number): Promise<boolean>;
  getOrphan(id: number): Promise<any | undefined>;

  // Requests
  getRequestsByFamilyId(familyId: number): Promise<Request[]>;
  getAllRequests(): Promise<Request[]>;
  getAllRequestsWithFamilies(): Promise<(Request & { family: Family })[]>;
  getRequest(id: number): Promise<Request | undefined>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequest(id: number, request: Partial<InsertRequest>): Promise<Request | undefined>;

  // Notifications
  getAllNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: number, userId: number): Promise<boolean>;
  getUnreadNotificationsCount(userId: number): Promise<number>;

  // Documents
  getDocumentsByFamilyId(familyId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;

  // Logs
  getLogs(filter?: { type?: string; userId?: number; search?: string; limit?: number; offset?: number; startDate?: string; endDate?: string }): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
  getLogStatistics(startDate?: string, endDate?: string): Promise<any>;

  // Settings
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string, description?: string): Promise<void>;
  getAllSettings(): Promise<Settings[]>;
  clearSettingsCache(): void;

  // Support Vouchers
  getAllSupportVouchers(): Promise<(SupportVoucher & { creator: User; recipients: VoucherRecipient[] })[]>;
  getAllSupportVouchersOptimized(): Promise<(SupportVoucher & { creator: User; recipients: (VoucherRecipient & { family: Family })[] })[]>;
  getSupportVoucher(id: number): Promise<SupportVoucher | undefined>;
  createSupportVoucher(voucher: InsertSupportVoucher): Promise<SupportVoucher>;
  updateSupportVoucher(id: number, voucher: Partial<InsertSupportVoucher>): Promise<SupportVoucher | undefined>;

  // Voucher Recipients
  getVoucherRecipients(voucherId: number): Promise<(VoucherRecipient & { family: Family })[]>;
  getVoucherRecipientsOptimized(voucherId: number): Promise<(VoucherRecipient & { family: Family })[]>;
  createVoucherRecipient(recipient: InsertVoucherRecipient): Promise<VoucherRecipient>;
  updateVoucherRecipient(id: number, recipient: Partial<InsertVoucherRecipient>): Promise<VoucherRecipient | undefined>;

  clearLogs(): Promise<void>;
  clearNotifications(): Promise<void>;
  clearRequests(): Promise<void>;
  clearMembers(): Promise<void>;
  clearFamilies(): Promise<void>;
  clearUsers(): Promise<void>;
  clearHeads(): Promise<void>;
  clearSettings(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Settings cache to avoid repeated database queries
  private settingsCache: Map<string, string> = new Map();
  private settingsCacheExpiry: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
  }

  // Users
  async getUser(id: number, opts?: { includeDeleted?: boolean }): Promise<User | undefined> {
    const whereClause = opts?.includeDeleted
      ? eq(users.id, id)
      : and(eq(users.id, id), isNull(users.deletedAt));
    const [user] = await db.select().from(users).where(whereClause);
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await withRetry(() =>
      db.select().from(users).where(and(eq(users.username, username), isNull(users.deletedAt)))
    );
    return user || undefined;
  }

  async getUserByNationalId(nationalId: string): Promise<User | undefined> {
    const [family] = await db.select({ user: users }).from(families)
      .innerJoin(users, and(eq(families.userId, users.id), isNull(users.deletedAt)))
      .where(eq(families.husbandID, nationalId));
    return family?.user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    // Handle references to the user before deleting
    // Set userId to null in logs
    await db.update(logs).set({ userId: null }).where(eq(logs.userId, id));
    // Set updatedBy to null in voucherRecipients
    await db.update(voucherRecipients).set({ updatedBy: null }).where(eq(voucherRecipients.updatedBy, id));
    // Transfer support vouchers created by this user to a default admin user (ID 1) to avoid notNull constraint
    await db.update(supportVouchers).set({ createdBy: 1 }).where(eq(supportVouchers.createdBy, id));

    const result = await db.delete(users).where(eq(users.id, id));
    return (result?.rowCount ?? 0) > 0;
  }

  async getAllUsers(opts?: { includeDeleted?: boolean }): Promise<User[]> {
    if (opts?.includeDeleted) {
    return await db.select().from(users);
    }
    return await db.select().from(users).where(isNull(users.deletedAt));
  }

  async getUsersByIds(ids: number[]): Promise<User[]> {
    if (ids.length === 0) return [];
    return await db.select().from(users).where(inArray(users.id, ids));
  }

  async softDeleteUser(id: number): Promise<boolean> {
    // Remove references to the user in related tables before soft deleting the user
    await db.update(logs).set({ userId: null }).where(eq(logs.userId, id));
    // For voucherRecipients, set updatedBy to null
    await db.update(voucherRecipients).set({ updatedBy: null }).where(eq(voucherRecipients.updatedBy, id));
    // Transfer support vouchers created by this user to a default admin user (ID 1) to avoid notNull constraint
    await db.update(supportVouchers).set({ createdBy: 1 }).where(eq(supportVouchers.createdBy, id));

    const [user] = await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, id)).returning();
    return !!user;
  }

  async restoreUser(id: number): Promise<boolean> {
    const [user] = await db.update(users).set({ deletedAt: null }).where(eq(users.id, id)).returning();
    return !!user;
  }

  // Families
  async getFamily(id: number): Promise<Family | undefined> {
    const [family] = await db.select().from(families).where(eq(families.id, id));
    return family || undefined;
  }

  async getFamilyByUserId(userId: number): Promise<Family | undefined> {
    const [family] = await db.select().from(families).where(eq(families.userId, userId));
    return family || undefined;
  }

  async createFamily(family: InsertFamily): Promise<Family> {
    const [createdFamily] = await db.insert(families).values(family).returning();
    return createdFamily;
  }

  async updateFamily(id: number, family: Partial<InsertFamily>): Promise<Family | undefined> {
    const [updatedFamily] = await db.update(families).set(family).where(eq(families.id, id)).returning();
    return updatedFamily || undefined;
  }

  async getAllFamilies(branch?: string): Promise<Family[]> {
    if (branch) {
      const result = await db.select().from(families)
        .innerJoin(users, eq(families.userId, users.id))
        .where(eq(users.branch, branch))
        .orderBy(desc(families.createdAt));
      return result.map(r => r.families);
    } else {
      // If branch is null/undefined/empty, return all families
      return await db.select().from(families).orderBy(desc(families.createdAt));
    }
  }

  async getAllFamiliesWithMembers(): Promise<(Family & { members: Member[] })[]> {
    const allFamilies = await this.getAllFamilies();
    const familiesWithMembers = await Promise.all(
      allFamilies.map(async (family) => {
        const members = await this.getMembersByFamilyId(family.id);
        return { ...family, members };
      })
    );
    return familiesWithMembers;
  }

  // Optimized version using JOIN to avoid N+1 queries
  async getAllFamiliesWithMembersOptimized(): Promise<(Family & { members: Member[]; orphans: Orphan[] })[]> {
    // Get all families first
    const allFamilies = await this.getAllFamilies();

    // Get ALL members in one query instead of 721 separate queries
    const allMembers = await db.select().from(members);

    // Get ALL orphans in one query instead of 721 separate queries
    const allOrphans = await db.select().from(orphans);

    // Group members by familyId for O(1) lookup
    const membersByFamilyId = new Map<number, Member[]>();
    allMembers.forEach(member => {
      if (!membersByFamilyId.has(member.familyId)) {
        membersByFamilyId.set(member.familyId, []);
      }
      membersByFamilyId.get(member.familyId)!.push(member);
    });

    // Group orphans by familyId for O(1) lookup
    const orphansByFamilyId = new Map<number, Orphan[]>();
    allOrphans.forEach(orph => {
      if (!orphansByFamilyId.has(orph.familyId)) {
        orphansByFamilyId.set(orph.familyId, []);
      }
      orphansByFamilyId.get(orph.familyId)!.push(orph);
    });

    // Combine families with their members and orphans
    const familiesWithMembersAndOrphans = allFamilies.map(family => ({
      ...family,
      members: membersByFamilyId.get(family.id) || [],
      orphans: orphansByFamilyId.get(family.id) || []
    }));

    return familiesWithMembersAndOrphans;
  }

  // Optimized version including requests to avoid N+1 queries
  async getAllFamiliesWithMembersAndRequestsOptimized(branch?: string): Promise<(Family & { members: Member[]; orphans: Orphan[]; requests: Request[] })[]> {
    // Get all families first
    let allFamilies: Family[];

    // If branch is provided, filter families by users in that branch
    if (branch) {
      const allFamiliesResult = await db.select().from(families)
        .innerJoin(users, eq(families.userId, users.id))
        .where(eq(users.branch, branch))
        .orderBy(desc(families.createdAt));
      // Extract the family data from the joined result
      allFamilies = allFamiliesResult.map(result => result.families);
    } else {
      // If branch is null/undefined/empty, get all families without filtering
      allFamilies = await db.select().from(families).orderBy(desc(families.createdAt));
    }

    // Get ALL members in one query instead of 721 separate queries
    const allMembers = await db.select().from(members);

    // Get ALL orphans in one query instead of 721 separate queries
    const allOrphans = await db.select().from(orphans);

    // Get ALL requests in one query instead of 721 separate queries
    const allRequests = await db.select().from(requests);

    // Group members by familyId for O(1) lookup
    const membersByFamilyId = new Map<number, Member[]>();
    allMembers.forEach(member => {
      if (!membersByFamilyId.has(member.familyId)) {
        membersByFamilyId.set(member.familyId, []);
      }
      membersByFamilyId.get(member.familyId)!.push(member);
    });

    // Group orphans by familyId for O(1) lookup
    const orphansByFamilyId = new Map<number, Orphan[]>();
    allOrphans.forEach(orph => {
      if (!orphansByFamilyId.has(orph.familyId)) {
        orphansByFamilyId.set(orph.familyId, []);
      }
      orphansByFamilyId.get(orph.familyId)!.push(orph);
    });

    // Group requests by familyId for O(1) lookup
    const requestsByFamilyId = new Map<number, Request[]>();
    allRequests.forEach(request => {
      if (!requestsByFamilyId.has(request.familyId)) {
        requestsByFamilyId.set(request.familyId, []);
      }
      requestsByFamilyId.get(request.familyId)!.push(request);
    });

    // Combine families with their members, orphans, and requests
    const familiesWithMembersOrphansAndRequests = allFamilies.map(family => ({
      ...family,
      members: membersByFamilyId.get(family.id) || [],
      orphans: orphansByFamilyId.get(family.id) || [],
      requests: requestsByFamilyId.get(family.id) || []
    }));

    return familiesWithMembersOrphansAndRequests;
  }

  async deleteFamily(id: number): Promise<boolean> {
    // Delete all members of the family
    await db.delete(members).where(eq(members.familyId, id));
    // Delete all orphans of the family
    await db.delete(orphans).where(eq(orphans.familyId, id));
    // Delete all requests of the family
    await db.delete(requests).where(eq(requests.familyId, id));
    // Delete all documents of the family
    await db.delete(documents).where(eq(documents.familyId, id));
    // Delete all voucher recipients of the family
    await db.delete(voucherRecipients).where(eq(voucherRecipients.familyId, id));
    // Delete the family itself
    const result = await db.delete(families).where(eq(families.id, id));
    return (result?.rowCount ?? 0) > 0;
  }

  async getFamiliesByUserId(userId: number): Promise<Family[]> {
    return await db.select().from(families).where(eq(families.userId, userId));
  }

  // Wife is now part of families table - retrieve from family data
  async getWifeByFamilyId(familyId: number): Promise<any | undefined> {
    const family = await this.getFamily(familyId);
    if (!family) return undefined;

    // Return wife data from the family object
    return {
      id: family.id, // Use family ID as the identifier for the wife data
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
      createdAt: family.createdAt // Using family's created at as reference
    };
  }

  async getWife(id: number): Promise<any | undefined> {
    // For now, this doesn't have a direct implementation since we don't have a separate wife table
    // We could implement this by searching for a family that has wife data matching the ID
    // But it's not a common use case
    return undefined;
  }

  async createWife(wife: any): Promise<any> {
    // Since wife data is now part of the family, we need to update the family with wife data
    if (!wife.familyId) throw new Error("Family ID is required to add wife data");

    const [updatedFamily] = await db.update(families).set({
      wifeName: wife.wifeName,
      wifeID: wife.wifeID,
      wifeBirthDate: wife.wifeBirthDate,
      wifeJob: wife.wifeJob,
      wifePregnant: wife.wifePregnant,
      wifeHasDisability: wife.wifeHasDisability,
      wifeDisabilityType: wife.wifeDisabilityType,
      wifeHasChronicIllness: wife.wifeHasChronicIllness,
      wifeChronicIllnessType: wife.wifeChronicIllnessType,
    }).where(eq(families.id, wife.familyId)).returning();

    return updatedFamily;
  }

  async updateWife(id: number, wife: Partial<any>): Promise<any | undefined> {
    // Find the family that has this wife data and update it
    const family = await this.getFamily(id);
    if (!family) return undefined;

    const [updatedFamily] = await db.update(families).set({
      wifeName: wife.wifeName,
      wifeID: wife.wifeID,
      wifeBirthDate: wife.wifeBirthDate,
      wifeJob: wife.wifeJob,
      wifePregnant: wife.wifePregnant,
      wifeHasDisability: wife.wifeHasDisability,
      wifeDisabilityType: wife.wifeDisabilityType,
      wifeHasChronicIllness: wife.wifeChronicIllness,
      wifeChronicIllnessType: wife.wifeChronicIllnessType,
    }).where(eq(families.id, id)).returning();

    return updatedFamily;
  }

  async deleteWife(id: number): Promise<boolean> {
    // Clear wife data from the family record instead of deleting a row
    // Find the family with wife data matching the ID
    const [family] = await db.select().from(families).where(
      and(
        eq(families.id, id),
        isNull(families.wifeName).neg() // Check if wifeName exists
      )
    );

    if (!family) return false;

    const result = await db.update(families).set({
      wifeName: null,
      wifeID: null,
      wifeBirthDate: null,
      wifeJob: null,
      wifePregnant: false,
    }).where(eq(families.id, id));

    return (result?.rowCount ?? 0) > 0;
  }

  // Members
  async getMembersByFamilyId(familyId: number): Promise<Member[]> {
    return await db.select().from(members).where(eq(members.familyId, familyId));
  }

  async getMember(id: number): Promise<Member | undefined> {
  const [member] = await db.select().from(members).where(eq(members.id, id));
  return member || undefined;
  }

  async createMember(member: InsertMember): Promise<Member> {
    const [createdMember] = await db.insert(members).values(member).returning();
    return createdMember;
  }

  async updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined> {
    const [updatedMember] = await db.update(members).set(member).where(eq(members.id, id)).returning();
    return updatedMember || undefined;
  }

  async deleteMember(id: number): Promise<boolean> {
    const result = await db.delete(members).where(eq(members.id, id));
    return (result?.rowCount ?? 0) > 0;
  }

  // Orphans
  async getOrphansByFamilyId(familyId: number): Promise<Orphan[]> {
    return await db.select().from(orphans).where(eq(orphans.familyId, familyId));
  }

  async getAllOrphans(): Promise<Orphan[]> {
    return await db.select().from(orphans);
  }

  async getOrphansCountUnder18ByFamilyId(familyId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(orphans)
      .where(
        and(
          eq(orphans.familyId, familyId),
          sql`(CAST(${orphans.orphanBirthDate} AS DATE) > (CURRENT_DATE - INTERVAL '18 years'))`
        )
      );
    return result[0]?.count || 0;
  }

  async getOrphan(id: number): Promise<Orphan | undefined> {
    const [orphan] = await db.select().from(orphans).where(eq(orphans.id, id));
    return orphan || undefined;
  }

  async createOrphan(orphan: InsertOrphan): Promise<Orphan> {
    const [createdOrphan] = await db.insert(orphans).values(orphan).returning();
    return createdOrphan;
  }

  async updateOrphan(id: number, orphan: Partial<InsertOrphan>): Promise<Orphan | undefined> {
    const [updatedOrphan] = await db.update(orphans).set(orphan).where(eq(orphans.id, id)).returning();
    return updatedOrphan || undefined;
  }

  async deleteOrphan(id: number): Promise<boolean> {
    const result = await db.delete(orphans).where(eq(orphans.id, id));
    return (result?.rowCount ?? 0) > 0;
  }

  // Requests
  async getRequestsByFamilyId(familyId: number): Promise<Request[]> {
    return await db.select().from(requests).where(eq(requests.familyId, familyId)).orderBy(desc(requests.createdAt));
  }

  async getAllRequests(): Promise<Request[]> {
    return await db.select().from(requests).orderBy(desc(requests.createdAt));
  }

  // Optimized version to avoid N+1 queries for requests with families
  async getAllRequestsWithFamilies(): Promise<(Request & { family: Family })[]> {
    // Get all requests first
    const allRequests = await this.getAllRequests();

    // Get all families in one query instead of N separate queries
    const allFamilies = await this.getAllFamilies();

    // Create family lookup map for O(1) access
    const familyMap = new Map<number, Family>();
    allFamilies.forEach(family => {
      familyMap.set(family.id, family);
    });

    // Combine requests with their families
    const requestsWithFamilies = allRequests.map(request => ({
      ...request,
      family: familyMap.get(request.familyId)!
    }));

    return requestsWithFamilies;
  }

  async getRequest(id: number): Promise<Request | undefined> {
    const [request] = await db.select().from(requests).where(eq(requests.id, id));
    return request || undefined;
  }

  async createRequest(request: InsertRequest): Promise<Request> {
    const [createdRequest] = await db.insert(requests).values(request).returning();
    return createdRequest;
  }

  async updateRequest(id: number, request: Partial<InsertRequest>): Promise<Request | undefined> {
    const [updatedRequest] = await db.update(requests).set({
      ...request,
      updatedAt: new Date()
    }).where(eq(requests.id, id)).returning();
    return updatedRequest || undefined;
  }

  // Notifications
  async getAllNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [createdNotification] = await db.insert(notifications).values(notification).returning();
    return createdNotification;
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          or(
            eq(notifications.target, 'all'),
            eq(notifications.target, 'head'),
            eq(notifications.target, 'urgent'),
            and(
              eq(notifications.target, 'specific'),
              sql`${userId} = ANY(${notifications.recipients})`
            )
          )
        )
      );
    return (result?.rowCount ?? 0) > 0;
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.read, false),
          or(
            eq(notifications.target, 'all'),
            eq(notifications.target, 'head'),
            eq(notifications.target, 'urgent'),
            and(
              eq(notifications.target, 'specific'),
              sql`${userId} = ANY(${notifications.recipients})`
            )
          )
        )
      );
    return result[0]?.count ?? 0;
  }

  // Documents
  async getDocumentsByFamilyId(familyId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.familyId, familyId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [createdDocument] = await db.insert(documents).values(document).returning();
    return createdDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result?.rowCount ?? 0) > 0;
  }

  // Logs
  async getLogs(filter: { type?: string; userId?: number; search?: string; limit?: number; offset?: number; startDate?: string; endDate?: string } = {}): Promise<Log[]> {
    let query = db.select().from(logs);
    if (filter.type) query = query.where(eq(logs.type, filter.type));
    if (filter.userId) query = query.where(eq(logs.userId, filter.userId));
    if (filter.search) query = query.where(sql`${logs.message} ILIKE '%' || ${filter.search} || '%'`);
    if (filter.startDate) query = query.where(sql`${logs.createdAt} >= ${filter.startDate}`);
    if (filter.endDate) query = query.where(sql`${logs.createdAt} <= ${filter.endDate}`);
    if (filter.limit) query = query.limit(filter.limit);
    if (filter.offset) query = query.offset(filter.offset);
    return await query.orderBy(desc(logs.createdAt));
  }
  async createLog(log: InsertLog): Promise<Log> {
    const [created] = await db.insert(logs).values(log).returning();
    return created;
  }

  async getLogStatistics(startDate?: string, endDate?: string): Promise<any> {
    // Get total log count with optional date range
    let totalQuery = db.select({ count: count() }).from(logs);
    if (startDate) totalQuery = totalQuery.where(sql`${logs.createdAt} >= ${startDate}`);
    if (endDate) totalQuery = totalQuery.where(sql`${logs.createdAt} <= ${endDate}`);
    const [totalCount] = await totalQuery;

    // Get log counts by type
    let typeQuery = db.select({ type: logs.type, count: count() }).from(logs).groupBy(logs.type);
    if (startDate) typeQuery = typeQuery.where(sql`${logs.createdAt} >= ${startDate}`);
    if (endDate) typeQuery = typeQuery.where(sql`${logs.createdAt} <= ${endDate}`);
    const typeCounts = await typeQuery;

    // Get log counts by user
    let userQuery = db.select({ userId: logs.userId, count: count() }).from(logs).groupBy(logs.userId);
    if (startDate) userQuery = userQuery.where(sql`${logs.createdAt} >= ${startDate}`);
    if (endDate) userQuery = userQuery.where(sql`${logs.createdAt} <= ${endDate}`);
    const userCounts = await userQuery;

    // Get daily log count
    let dailyQuery = db.select({
      date: sql<string>`DATE(${logs.createdAt})`.as('date'),
      count: count()
    }).from(logs).groupBy(sql`DATE(${logs.createdAt})`).orderBy(sql`DATE(${logs.createdAt})`);
    if (startDate) dailyQuery = dailyQuery.where(sql`${logs.createdAt} >= ${startDate}`);
    if (endDate) dailyQuery = dailyQuery.where(sql`${logs.createdAt} <= ${endDate}`);
    const dailyCounts = await dailyQuery;

    // Get recently active users
    let userActivityQuery = db.select({
      userId: logs.userId,
      lastActivity: max(logs.createdAt),
      totalLogs: count()
    }).from(logs).groupBy(logs.userId);
    if (startDate) userActivityQuery = userActivityQuery.where(sql`${logs.createdAt} >= ${startDate}`);
    if (endDate) userActivityQuery = userActivityQuery.where(sql`${logs.createdAt} <= ${endDate}`);
    const userActivity = await userActivityQuery;

    // Get counts of logs by families (by connecting logs to families through users)
    // This is complex as we need to join logs -> users -> families to get family stats
    let familyLogQuery = db.select({
      familyId: families.id,
      familyName: families.husbandName,
      logCount: count()
    })
    .from(logs)
    .leftJoin(users, eq(logs.userId, users.id))
    .leftJoin(families, eq(users.id, families.userId))
    .groupBy(families.id, families.husbandName);

    if (startDate) familyLogQuery = familyLogQuery.where(sql`${logs.createdAt} >= ${startDate}`);
    if (endDate) familyLogQuery = familyLogQuery.where(sql`${logs.createdAt} <= ${endDate}`);

    const familyLogCounts = await familyLogQuery;

    // Get unique family count (families that have at least one log)
    let uniqueFamilyQuery = db.select({ count: count() })
      .from(logs)
      .leftJoin(users, eq(logs.userId, users.id))
      .leftJoin(families, eq(users.id, families.userId))
      .where(isNotNull(families.id));

    if (startDate) uniqueFamilyQuery = uniqueFamilyQuery.where(sql`${logs.createdAt} >= ${startDate}`);
    if (endDate) uniqueFamilyQuery = uniqueFamilyQuery.where(sql`${logs.createdAt} <= ${endDate}`);

    const [uniqueFamilyCount] = await uniqueFamilyQuery;

    // Get unique family counts for specific log types that are related to families
    const familyLogTypes = ['family_creation', 'family_update', 'admin_family_update', 'spouse_update'];
    const typeFamilyCounts = {};

    for (const logType of familyLogTypes) {
        let query = db.select({ count: count() })
            .from(logs)
            .leftJoin(users, eq(logs.userId, users.id))
            .leftJoin(families, eq(users.id, families.userId))
            .where(and(eq(logs.type, logType), isNotNull(families.id)));

        if (startDate) query = query.where(sql`${logs.createdAt} >= ${startDate}`);
        if (endDate) query = query.where(sql`${logs.createdAt} <= ${endDate}`);

        const [result] = await query;
        typeFamilyCounts[logType] = result.count;
    }

    return {
      total: totalCount.count,
      familyCount: uniqueFamilyCount.count,
      byType: typeCounts,
      byUser: userCounts,
      daily: dailyCounts,
      userActivity: userActivity,
      byFamily: familyLogCounts.filter(f => f.familyId !== null), // Only include families that exist
      typeFamilyCounts: typeFamilyCounts
    };
  }

  // Settings (with caching)
  private isCacheValid(): boolean {
    return Date.now() < this.settingsCacheExpiry;
  }

  private async refreshSettingsCache(): Promise<void> {
    console.log('🔄 Refreshing settings cache...');
    const allSettings = await db.select().from(settings);
    this.settingsCache.clear();
    allSettings.forEach(setting => {
      this.settingsCache.set(setting.key, setting.value);
    });
    this.settingsCacheExpiry = Date.now() + this.CACHE_TTL;
    console.log(`✅ Settings cache refreshed with ${allSettings.length} settings`);
  }

  async getSetting(key: string): Promise<string | undefined> {
    if (!this.isCacheValid()) {
      await this.refreshSettingsCache();
    }
    return this.settingsCache.get(key);
  }

  async setSetting(key: string, value: string, description?: string): Promise<void> {
    await db.insert(settings).values({ key, value, description }).onConflictDoUpdate({
      target: settings.key,
      set: { value, description }
    });

    // Update cache immediately
    this.settingsCache.set(key, value);
    console.log(`🔄 Setting '${key}' updated in cache`);
  }

  async getAllSettings(): Promise<Settings[]> {
    if (!this.isCacheValid()) {
      await this.refreshSettingsCache();
    }

    // Convert cache to Settings array format
    const settingsArray: Settings[] = [];
    for (const [key, value] of this.settingsCache.entries()) {
      // Get full setting with description from database for consistency
      const [fullSetting] = await db.select().from(settings).where(eq(settings.key, key));
      if (fullSetting) {
        settingsArray.push(fullSetting);
      }
    }

    return settingsArray;
  }

  // Method to clear cache when settings are bulk updated
  clearSettingsCache(): void {
    this.settingsCache.clear();
    this.settingsCacheExpiry = 0;
    console.log('🗑️ Settings cache cleared');
  }

  // Support Vouchers
  async getAllSupportVouchers(): Promise<(SupportVoucher & { creator: User; recipients: VoucherRecipient[] })[]> {
    const vouchers = await db.select().from(supportVouchers).orderBy(desc(supportVouchers.createdAt));

    const vouchersWithDetails = await Promise.all(
      vouchers.map(async (voucher) => {
        const creator = await this.getUser(voucher.createdBy);
        const recipients = await this.getVoucherRecipients(voucher.id);
        return {
          ...voucher,
          creator: creator!,
          recipients
        };
      })
    );

    return vouchersWithDetails;
  }

  // Optimized version to avoid N+1 queries for support vouchers
  async getAllSupportVouchersOptimized(): Promise<(SupportVoucher & { creator: User; recipients: (VoucherRecipient & { family: Family })[] })[]> {
    // Get all vouchers
    const vouchers = await db.select().from(supportVouchers).orderBy(desc(supportVouchers.createdAt));

    // Get all users and families in bulk
    const [allUsers, allFamilies, allRecipients] = await Promise.all([
      this.getAllUsers(),
      this.getAllFamilies(),
      db.select().from(voucherRecipients)
    ]);

    // Create lookup maps for O(1) access
    const userMap = new Map<number, User>();
    allUsers.forEach(user => userMap.set(user.id, user));

    const familyMap = new Map<number, Family>();
    allFamilies.forEach(family => familyMap.set(family.id, family));

    // Group recipients by voucherId
    const recipientsByVoucherId = new Map<number, (VoucherRecipient & { family: Family })[]>();
    allRecipients.forEach(recipient => {
      const family = familyMap.get(recipient.familyId);
      if (family) {
        if (!recipientsByVoucherId.has(recipient.voucherId)) {
          recipientsByVoucherId.set(recipient.voucherId, []);
        }
        recipientsByVoucherId.get(recipient.voucherId)!.push({ ...recipient, family });
      }
    });

    // Combine vouchers with their details
    const vouchersWithDetails = vouchers.map(voucher => ({
      ...voucher,
      creator: userMap.get(voucher.createdBy)!,
      recipients: recipientsByVoucherId.get(voucher.id) || []
    }));

    return vouchersWithDetails;
  }

  async getSupportVoucher(id: number): Promise<SupportVoucher | undefined> {
    const [supportVoucher] = await db.select().from(supportVouchers).where(eq(supportVouchers.id, id));
    return supportVoucher || undefined;
  }

  async createSupportVoucher(voucher: InsertSupportVoucher): Promise<SupportVoucher> {
    const [createdVoucher] = await db.insert(supportVouchers).values(voucher).returning();
    return createdVoucher;
  }

  async updateSupportVoucher(id: number, voucher: Partial<InsertSupportVoucher>): Promise<SupportVoucher | undefined> {
    const [updatedVoucher] = await db.update(supportVouchers).set(voucher).where(eq(supportVouchers.id, id)).returning();
    return updatedVoucher || undefined;
  }

  // Voucher Recipients
  async getVoucherRecipients(voucherId: number): Promise<(VoucherRecipient & { family: Family })[]> {
    const recipients = await db.select().from(voucherRecipients).where(eq(voucherRecipients.voucherId, voucherId));

    const recipientsWithFamilies = await Promise.all(
      recipients.map(async (recipient) => {
        const family = await this.getFamily(recipient.familyId);
        return {
          ...recipient,
          family: family!
        };
      })
    );

    return recipientsWithFamilies;
  }

  // Optimized version to avoid N+1 queries for voucher recipients
  async getVoucherRecipientsOptimized(voucherId: number): Promise<(VoucherRecipient & { family: Family })[]> {
    // Get recipients for this voucher
    const recipients = await db.select().from(voucherRecipients).where(eq(voucherRecipients.voucherId, voucherId));

    if (recipients.length === 0) return [];

    // Get all families in one query instead of N separate queries
    const allFamilies = await this.getAllFamilies();

    // Create family lookup map for O(1) access
    const familyMap = new Map<number, Family>();
    allFamilies.forEach(family => familyMap.set(family.id, family));

    // Combine recipients with their families
    const recipientsWithFamilies = recipients.map(recipient => ({
      ...recipient,
      family: familyMap.get(recipient.familyId)!
    }));

    return recipientsWithFamilies;
  }

  async createVoucherRecipient(recipient: InsertVoucherRecipient): Promise<VoucherRecipient> {
    const [createdRecipient] = await db.insert(voucherRecipients).values(recipient).returning();
    return createdRecipient;
  }

  async updateVoucherRecipient(id: number, recipient: Partial<InsertVoucherRecipient>): Promise<VoucherRecipient | undefined> {
    const [updatedRecipient] = await db.update(voucherRecipients).set(recipient).where(eq(voucherRecipients.id, id)).returning();
    return updatedRecipient || undefined;
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
    await db.delete(families);
  }
  async clearUsers() {
    await db.delete(users);
  }

  async clearHeads() {
    // Get all head users first to identify their families for cleanup
    const headUsers = await db.select({ id: users.id, username: users.username }).from(users).where(eq(users.role, 'head'));
    const headUserIds = headUsers.map(user => user.id);

    if (headUserIds.length > 0) {
      // Delete families associated with head users
      await db.delete(families).where(inArray(families.userId, headUserIds));
      // Delete the head users themselves
      await db.delete(users).where(inArray(users.id, headUserIds));
    }
  }

  async clearWives() {
    // Update to clear wife data from families table instead of deleting wife table
    const result = await db.update(families).set({
      wifeName: null,
      wifeID: null,
      wifeBirthDate: null,
      wifeJob: null,
      wifePregnant: false,
    });
    return (result?.rowCount ?? 0) > 0;
  }
  async clearSettings() {
    await db.delete(settings);
  }
}

export const storage = new DatabaseStorage();