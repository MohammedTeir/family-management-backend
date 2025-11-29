import { db } from '../db';
import { users, families } from '../schema';
import { eq, and, inArray } from 'drizzle-orm';
import { hashPassword } from '../auth';

// Define the expected structure for family data (as would come from Excel import)
export interface ImportFamilyData {
  id?: string;
  userId?: number;
  husbandName: string;
  husbandID: string;
  husbandBirthDate?: string;
  husbandJob?: string;
  hasDisability?: boolean;
  disabilityType?: string;
  hasChronicIllness?: boolean;
  chronicIllnessType?: string;
  wifeName?: string;
  wifeID?: string;
  wifeBirthDate?: string;
  wifeJob?: string;
  wifePregnant?: boolean;
  wifeHasDisability?: boolean;
  wifeDisabilityType?: string;
  wifeHasChronicIllness?: boolean;
  wifeChronicIllnessType?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  originalResidence?: string;
  currentHousing?: string;
  isDisplaced?: boolean;
  displacedLocation?: string;
  isAbroad?: boolean;
  warDamage2023?: boolean;
  warDamageDescription?: string;
  branch?: string;
  landmarkNear?: string;
  totalMembers?: number;
  numMales?: number;
  numFemales?: number;
  socialStatus?: string;
  adminNotes?: string;
  gender?: string;
  headGender?: string;
}

export class BulkImportService {
  /**
   * Performs a fast bulk insert of family data with associated user creation
   * Optimized for performance to avoid timeouts
   */
  static async bulkInsertFamilies(familiesData: ImportFamilyData[], chunkSize: number = 10) {
    const results = [];

    // Process smaller chunks to prevent timeouts
    for (let i = 0; i < familiesData.length; i += chunkSize) {
      const chunk = familiesData.slice(i, i + chunkSize);

      // Pre-hash passwords to avoid async issues in the transaction
      const processedChunk = await Promise.all(chunk.map(async (family) => {
        const hashedPassword = await hashPassword(family.husbandID); // Default password is same as ID
        return {
          ...family,
          hashedPassword
        };
      }));

      // Create users and families in a single transaction per chunk
      const result = await db.transaction(async (tx) => {
        // Create users in batch first to avoid individual operations
        const usersToInsert = processedChunk.map(family => ({
          username: family.husbandID,
          password: family.hashedPassword, // Use the pre-hashed password
          role: 'head',
          gender: family.headGender || family.gender || 'male',
          phone: family.primaryPhone || null
        }));

        // Insert users with conflict resolution (skip if already exists)
        await tx.insert(users)
          .values(usersToInsert)
          .onConflictDoNothing()
          .execute(); // Don't return results to save memory for large imports

        // Get all users (both new and existing) by querying for all IDs we tried to insert
        const allUsernames = processedChunk.map(family => family.husbandID);
        const allUsers = await tx.select({ id: users.id, username: users.username })
          .from(users)
          .where(inArray(users.username, allUsernames));

        // Create families in batch for all users
        const familiesToInsert = processedChunk
          .map(family => {
            const userResult = allUsers.find(u => u.username === family.husbandID);
            if (!userResult) {
              console.error(`User ${family.husbandID} not found after processing`);
              return null;
            }

            return {
              userId: userResult.id,
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
              adminNotes: family.adminNotes || null,
            };
          })
          .filter((family): family is NonNullable<typeof family> => family !== null); // Remove null entries with proper typing

        // Insert families with conflict resolution
        if (familiesToInsert.length > 0) {
          await tx.insert(families)
            .values(familiesToInsert)
            .onConflictDoNothing()
            .execute();
        }

        return { userResults: allUsers, totalProcessed: allUsers.length };
      });

      results.push(result);
    }

    return results;
  }

  /**
   * Validates family data before import
   */
  static validateFamilyData(familiesData: any[]): { valid: ImportFamilyData[], errors: string[] } {
    const valid: ImportFamilyData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < familiesData.length; i++) {
      const item = familiesData[i];
      const rowIndex = i + 2; // Excel rows start from 2 (after header)
      const validationErrors: string[] = [];

      // Validate required fields
      if (!item.husbandName) {
        validationErrors.push(`الصف ${rowIndex}: اسم رب الأسرة مطلوب`);
      }

      if (!item.husbandID) {
        validationErrors.push(`الصف ${rowIndex}: رقم الهوية مطلوب`);
      } else {
        // Validate ID format (9 digits)
        const husbandID = String(item.husbandID);
        if (!/^\d{9}$/.test(husbandID)) {
          validationErrors.push(`الصف ${rowIndex}: رقم الهوية ${husbandID} يجب أن يكون 9 أرقام`);
        }
      }

      // Validate wife ID if provided
      if (item.wifeID && !/^\d{9}$/.test(String(item.wifeID))) {
        validationErrors.push(`الصف ${rowIndex}: رقم هوية الزوجة ${item.wifeID} يجب أن يكون 9 أرقام`);
      }

      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
      } else {
        // Sanitize and add to valid data
        valid.push({
          husbandName: String(item.husbandName || ''),
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
          gender: item.gender || 'male',
          headGender: item.headGender || 'male',
        });
      }
    }

    return { valid, errors };
  }

  /**
   * Checks for duplicate IDs in the batch
   */
  static checkForDuplicates(familiesData: ImportFamilyData[]): string[] {
    const ids = new Set<string>();
    const duplicates: string[] = [];

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
  static async fastBulkImport(familiesData: ImportFamilyData[]) {
    // Validate the data first
    const { valid, errors } = this.validateFamilyData(familiesData);

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Check for duplicates
    const duplicates = this.checkForDuplicates(valid);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate IDs found: ${duplicates.join(', ')}`);
    }

    // Perform the bulk insert with smaller chunk size to prevent timeouts
    return await this.bulkInsertFamilies(valid, 2); // Even smaller chunk size for better timeout handling
  }
}