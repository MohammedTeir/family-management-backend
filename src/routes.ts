import type { Express } from "express";
import { createServer, type Server } from "http";
import { authMiddleware, loginHandler, getCurrentUser, logoutHandler } from "./jwt-auth";
import { comparePasswords, hashPassword } from "./auth";
import { storage } from "./storage";
import { insertFamilySchema, insertMemberSchema, insertRequestSchema, insertNotificationSchema, insertSupportVoucherSchema, insertVoucherRecipientSchema, members, orphans, insertOrphanSchema, importSessions, insertImportSessionSchema, ImportSession } from "./schema.js";
import { db } from "./db";
import { checkDatabaseHealth } from "./db-retry.js";
import { z } from "zod";
import multer from "multer";
import cors from "cors";
import pg from "pg";
import * as XLSX from "xlsx";
import { eq, and } from "drizzle-orm";
const upload = multer({ storage: multer.memoryStorage() });

// Multer configuration for orphan image uploads with size limits
const orphanUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for orphan images
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any, false);
    }
  }
});

// Utility function for request type translation
function getRequestTypeInArabic(type: string): string {
  switch (type) {
    case 'financial': return 'مساعدة مالية';
    case 'medical': return 'مساعدة طبية';
    case 'damage': return 'تعويض أضرار';
    default: return type;
  }
}

// Helper: isHeadOrDualRole
function isHeadOrDualRole(user: any, family?: any) {
  // True if user is head, or admin with a family (dual-role)
  return user.role === 'head' || (user.role === 'admin' && family);
}

// Helper: getSpouseFieldName
function getSpouseFieldName(headGender: string | null): string {
  if (!headGender || headGender === 'male') {
    return 'wife';
  } else if (headGender === 'female') {
    return 'husband';
  } else {
    // For 'other' or undefined, default to 'spouse' or use wife as default
    return 'wife'; // default to traditional field names for compatibility
  }
}

// Helper: getSpouseDataWithGenderLabel
function getSpouseDataWithGenderLabel(family: any, headGender: string | null) {
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

// Helper: getFamilyByIdOrDualRole
async function getFamilyByIdOrDualRole(familyId: number, user?: any) {
  let family = await storage.getFamily(familyId);
  if (!family) {
    return null; // Don't look for other families if the specific one doesn't exist
  }

  // If user is provided and is an admin (not root), check if the family belongs to their branch
  if (user && user.role === 'admin') {
    // If admin has no branch assigned, they can't access any families
    if (!user.branch) {
      return null;
    }

    const userFamily = await storage.getFamilyByUserId(user.id);
    if (userFamily && userFamily.id === familyId) {
      return family; // Allow admin to access their own family (dual role)
    }

    // Check if family belongs to the admin's branch OR if the family has no branch assigned
    if (family.branch === user.branch || !family.branch) {
      return family;
    }
    return null; // Admin doesn't have access to this family
  }

  // Root users can access all families
  if (user && user.role === 'root') {
    return family;
  }

  return family;
}

export function registerRoutes(app: Express): Server {
  // Add CORS configuration for cross-origin requests
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: false, // No longer need credentials for JWT
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Default routes
  app.get("/", (req, res) => {
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

  app.get("/api", (req, res) => {
    res.json({
      message: "Family Management System API",
      version: "1.0.0",
      status: "running",
      timestamp: new Date().toISOString(),
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

  // JWT Authentication routes
  app.post("/api/login", loginHandler);
  app.post("/api/logout", logoutHandler);
  app.get("/api/user", authMiddleware, getCurrentUser);
  
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const dbHealth = await checkDatabaseHealth();
      
      const health = {
        status: dbHealth.healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          healthy: dbHealth.healthy,
          error: dbHealth.error || null
        },
        serverless: {
          platform: 'netlify-functions',
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }
      };
      
      if (dbHealth.healthy) {
        res.status(200).json(health);
      } else {
        res.status(503).json(health);
      }
    } catch (error: any) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  // Initialize import session - returns session ID and total records
  app.post("/api/admin/import-heads/init", authMiddleware, upload.single("excel"), async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) {
      console.log(`❌ Unauthorized import attempt by user: ${req.user?.username || 'anonymous'}`);
      return res.sendStatus(403);
    }

    try {
      if (!req.file) {
        console.log('❌ No file uploaded');
        return res.status(400).json({ message: "يرجى رفع ملف Excel" });
      }

      console.log(`📊 Initializing import session for user: ${req.user!.username}`);
      console.log(`📁 File uploaded: ${req.file.originalname}, Size: ${req.file.size} bytes`);

      // Validate file size (max 20MB for import sessions)
      if (req.file.size > 20 * 1024 * 1024) {
        console.log(`❌ File too large: ${req.file.size} bytes`);
        return res.status(400).json({ message: "حجم الملف كبير جداً. الحد الأقصى 20 ميجابايت" });
      }

      // Parse Excel file to get total count
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      console.log(`📋 Processing sheet: ${sheetName}`);

      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        console.log('❌ Empty Excel file');
        return res.status(400).json({ message: "ملف Excel فارغ أو لا يحتوي على بيانات" });
      }

      console.log(`📊 Found ${data.length} rows to process`);

      // Transform the Excel data to match our schema (similar to original validation)
      const transformedData = [];
      const errors: string[] = [];
      const allHusbandIDs = new Set<string>();

      for (let i = 0; i < data.length; i++) {
        const row: any = data[i];
        const rowIndex = i + 2;

        try {
          // Convert all values to strings where needed and handle Excel's data types
          const husbandName = row['husbandName'] || row['husband_name'] || row['اسم رب الأسرة'];
          const husbandID = row['husbandID'] || row['husband_id'] || row['رقم هوية رب الأسرة'];

          // Handle different Excel data formats
          const processedHusbandID = String(husbandID || '').trim();
          const processedHusbandName = String(husbandName || '').trim();

          // Validate required fields
          if (!processedHusbandName || !processedHusbandID) {
            const missingFields = [];
            if (!processedHusbandName) missingFields.push('اسم رب الأسرة');
            if (!processedHusbandID) missingFields.push('رقم الهوية');
            errors.push(`الصف ${rowIndex}: الحقول المطلوبة مفقودة (${missingFields.join(' و ')})`);
            continue;
          }

          // Validate ID format (9 digits)
          if (!/^\d{9}$/.test(processedHusbandID)) {
            errors.push(`الصف ${rowIndex}: رقم الهوية ${processedHusbandID} يجب أن يكون 9 أرقام`);
            continue;
          }

          // Validate wife ID if provided
          const wifeID = row['wifeID'] || row['wife_id'] || row['رقم هوية الزوجة'] || null;
          if (wifeID && !/^\d{9}$/.test(String(wifeID))) {
            errors.push(`الصف ${rowIndex}: رقم هوية الزوجة ${wifeID} يجب أن يكون 9 أرقام`);
            continue;
          }

          // Check for duplicates within the file
          if (allHusbandIDs.has(processedHusbandID)) {
            errors.push(`الصف ${rowIndex}: رقم الهوية ${processedHusbandID} مكرر في الملف`);
            continue;
          }

          allHusbandIDs.add(processedHusbandID);

          // Transform the data to match our schema - handle various column name formats
          transformedData.push({
            husbandName: processedHusbandName,
            husbandID: processedHusbandID,
            husbandBirthDate: row['husbandBirthDate'] || row['husband_birth_date'] || row['تاريخ ميلاد رب الأسرة'] || null,
            husbandJob: row['husbandJob'] || row['husband_job'] || row['وظيفة رب الأسرة'] || null,
            hasDisability: Boolean(row['hasDisability'] || row['has_disability'] || row['لديه إعاقة'] || false),
            disabilityType: row['disabilityType'] || row['disability_type'] || row['نوع الإعاقة'] || null,
            hasChronicIllness: Boolean(row['hasChronicIllness'] || row['has_chronic_illness'] || row['لديه مرض مزمن'] || false),
            chronicIllnessType: row['chronicIllnessType'] || row['chronic_illness_type'] || row['نوع المرض المزمن'] || null,
            wifeName: row['wifeName'] || row['wife_name'] || row['اسم الزوجة'] || null,
            wifeID: wifeID,
            wifeBirthDate: row['wifeBirthDate'] || row['wife_birth_date'] || row['تاريخ ميلاد الزوجة'] || null,
            wifeJob: row['wifeJob'] || row['wife_job'] || row['وظيفة الزوجة'] || null,
            wifePregnant: Boolean(row['wifePregnant'] || row['wife_pregnant'] || row['الزوجة حامل'] || false),
            wifeHasDisability: Boolean(row['wifeHasDisability'] || row['wife_has_disability'] || row['الزوجة تعاني من إعاقة'] || false),
            wifeDisabilityType: row['wifeDisabilityType'] || row['wife_disability_type'] || row['نوع إعاقة الزوجة'] || null,
            wifeHasChronicIllness: Boolean(row['wifeHasChronicIllness'] || row['wife_has_chronic_illness'] || row['الزوجة تعاني من مرض مزمن'] || false),
            wifeChronicIllnessType: row['wifeChronicIllnessType'] || row['wife_chronic_illness_type'] || row['نوع مرض الزوجة المزمن'] || null,
            primaryPhone: row['primaryPhone'] || row['primary_phone'] || row['الهاتف الرئيسي'] ? String(row['primaryPhone'] || row['primary_phone'] || row['الهاتف الرئيسي']) : null,
            secondaryPhone: row['secondaryPhone'] || row['secondary_phone'] || row['الهاتف الثانوي'] ? String(row['secondaryPhone'] || row['secondary_phone'] || row['الهاتف الثانوي']) : null,
            originalResidence: row['originalResidence'] || row['original_residence'] || row['المنطقة الأصلية'] || null,
            currentHousing: row['currentHousing'] || row['current_housing'] || row['مكان السكن الحالي'] || null,
            isDisplaced: Boolean(row['isDisplaced'] || row['is_displaced'] || row['مُهجّر'] || false),
            displacedLocation: row['displacedLocation'] || row['displaced_location'] || row['مكان التهجير'] || null,
            isAbroad: Boolean(row['isAbroad'] || row['is_abroad'] || row['في الخارج'] || false),
            warDamage2023: Boolean(row['warDamage2023'] || row['war_damage_2023'] || row['تضرر من الحرب 2023'] || false),
            warDamageDescription: row['warDamageDescription'] || row['war_damage_description'] || row['وصف الضرر'] || null,
            branch: row['branch'] || row['الفرع'] || null,
            landmarkNear: row['landmarkNear'] || row['landmark_near'] || row['معلم قريب'] || null,
            totalMembers: parseInt(String(row['totalMembers'] || row['total_members'] || row['إجمالي الأفراد'] || 0)) || 0,
            numMales: parseInt(String(row['numMales'] || row['num_males'] || row['عدد الذكور'] || 0)) || 0,
            numFemales: parseInt(String(row['numFemales'] || row['num_females'] || row['عدد الإناث'] || 0)) || 0,
            socialStatus: row['socialStatus'] || row['social_status'] || row['الحالة الاجتماعية'] || null,
            adminNotes: row['adminNotes'] || row['admin_notes'] || row['ملاحظات المشرف'] || null,
            gender: row['gender'] || row['الجنس'] || 'male',
            headGender: row['headGender'] || row['head_gender'] || row['جنس رب الأسرة'] || 'male',
          });

        } catch (error: any) {
          console.error(`❌ Error processing row ${rowIndex}:`, error.message);
          errors.push(`الصف ${rowIndex}: ${error.message}`);
        }
      }

      console.log(`✅ Validation completed: ${transformedData.length} valid rows, ${errors.length} invalid rows`);

      // Generate a session ID for this import
      const sessionId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store the import session in the database
      const sessionData = insertImportSessionSchema.parse({
        sessionId,
        userId: req.user!.id,
        totalRecords: data.length, // Total in original file
        validRecords: transformedData.length,
        invalidRecords: errors.length,
        uploadedAt: new Date(),
        originalFilename: req.file.originalname,
        processed: 0,
        status: "initialized",
        transformedData: JSON.stringify(transformedData), // Store as JSON string
        invalidRows: JSON.stringify(errors), // Store as JSON string
      });

      // Insert the session into database
      await db.insert(importSessions).values(sessionData);

      console.log(`✅ Import session initialized: ${sessionId} for ${transformedData.length} valid records (skipped ${errors.length} invalid rows)`);

      res.json({
        sessionId,
        totalRecords: data.length,
        validRecords: transformedData.length,
        invalidRecords: errors.length,
        invalidRows: errors.slice(0, 20), // Include first 20 invalid rows in the response
        message: errors.length > 0
          ? `تم تهيئة جلسة الاستيراد لـ ${transformedData.length} سجل صحيح (تم تخطي ${errors.length} سجل غير صحيح)`
          : `تم تهيئة جلسة الاستيراد لـ ${transformedData.length} سجل`
      });

    } catch (error: any) {
      console.error('❌ Error initializing import session:', error);
      res.status(500).json({
        message: "خطأ في تهيئة جلسة الاستيراد",
        error: error.message
      });
    }
  });

  // Process chunk of imported data
  app.post("/api/admin/import-heads/chunk", authMiddleware, async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) {
      return res.sendStatus(403);
    }

    try {
      const { sessionId, startIdx, chunkSize = 50 } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      // Get session data from database
      const sessionResult = await db.select().from(importSessions).where(eq(importSessions.sessionId, sessionId));
      if (!sessionResult || sessionResult.length === 0) {
        return res.status(400).json({ message: "Invalid session ID" });
      }

      const session = sessionResult[0];

      // Parse the stored JSON data
      const transformedData = JSON.parse(session.transformedData as string || '[]');

      // Get the chunk of data to process - use smaller default chunk size to prevent timeouts
      const effectiveChunkSize = Math.min(chunkSize, 3); // Reduced default chunk size from 50 to 3
      const startIndex = startIdx || session.processed || 0;
      const endIndex = Math.min(startIndex + effectiveChunkSize, transformedData.length);
      const chunk = transformedData.slice(startIndex, endIndex);

      if (chunk.length === 0) {
        // No more data to process
        const progress = 100;
        const processed = session.totalRecords;

        res.json({
          success: true,
          processed,
          total: session.totalRecords,
          progress,
          sessionId: sessionId,
          message: `اكتمل استيراد ${processed} سجل`,
          done: true
        });
        return;
      }

      console.log(`📊 Processing chunk for session ${sessionId}: ${chunk.length} records, start: ${startIndex}, end: ${endIndex}`);

      try {
        // Import the chunk using our optimized service
        const { BulkImportService } = await import('./services/bulk-import.service.js');
        const result = await BulkImportService.fastBulkImport(chunk);

        // Update session progress in the database
        const newProcessedCount = endIndex;
        await db.update(importSessions)
          .set({
            processed: newProcessedCount,
            status: newProcessedCount >= transformedData.length ? "completed" : "in-progress",
            updatedAt: new Date()
          })
          .where(eq(importSessions.sessionId, sessionId));

        const progress = Math.round((newProcessedCount / session.totalRecords) * 100);

        console.log(`✅ Chunk processed: ${newProcessedCount}/${session.totalRecords} (${progress}%)`);

        res.json({
          success: true,
          processed: newProcessedCount,
          total: session.totalRecords,
          progress: progress,
          sessionId: sessionId,
          message: `تمت معالجة ${newProcessedCount}/${session.totalRecords} سجل`,
          done: newProcessedCount >= transformedData.length
        });
      } catch (error) {
        console.error(`❌ Error processing chunk for session ${sessionId}:`, error);

        // Update status to failed in the database
        await db.update(importSessions)
          .set({
            status: "failed",
            updatedAt: new Date()
          })
          .where(eq(importSessions.sessionId, sessionId));

        res.status(500).json({
          success: false,
          message: "خطأ في معالجة جزء من البيانات",
          error: error instanceof Error ? error.message : "Unknown error",
          sessionId: sessionId
        });
      }

    } catch (error: any) {
      console.error('❌ Error processing import chunk:', error);
      res.status(500).json({
        message: "خطأ في معالجة جزء من البيانات",
        error: error.message
      });
    }
  });

  // Get import status
  app.get("/api/admin/import-heads/status/:sessionId", authMiddleware, async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) {
      return res.sendStatus(403);
    }

    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      // Get session data from database
      const sessionResult = await db.select().from(importSessions).where(eq(importSessions.sessionId, sessionId));
      if (!sessionResult || sessionResult.length === 0) {
        return res.status(404).json({ message: "Session not found" });
      }

      const session = sessionResult[0];

      const progress = session.totalRecords > 0
        ? Math.round((session.processed / session.totalRecords) * 100)
        : 0;

      // Parse invalid rows from JSON string
      let invalidRows: string[] = [];
      try {
        invalidRows = JSON.parse(session.invalidRows as string || '[]');
      } catch (e) {
        console.error('Error parsing invalid rows from session:', e);
      }

      res.json({
        sessionId: session.sessionId,
        processed: session.processed,
        total: session.totalRecords,
        validRecords: session.validRecords,
        invalidRecords: session.invalidRecords,
        invalidRows: invalidRows, // Include invalid rows in status
        progress: progress,
        status: session.status,
        message: `مستوى التقدم ${progress}%`
      });

    } catch (error: any) {
      console.error('❌ Error getting import status:', error);
      res.status(500).json({
        message: "خطأ في الحصول على حالة الاستيراد",
        error: error.message
      });
    }
  });

  // Finalize import session
  app.post("/api/admin/import-heads/finalize", authMiddleware, async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) {
      return res.sendStatus(403);
    }

    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      // Get session data from database to return processed count
      const sessionResult = await db.select().from(importSessions).where(eq(importSessions.sessionId, sessionId));
      if (!sessionResult || sessionResult.length === 0) {
        return res.status(400).json({ message: "Invalid session ID" });
      }

      const session = sessionResult[0];

      // Clean up the session by deleting it from the database
      await db.delete(importSessions).where(eq(importSessions.sessionId, sessionId));

      console.log(`✅ Import session ${sessionId} finalized`);

      res.json({
        success: true,
        message: `تم الانتهاء من استيراد ${session.processed} سجل بنجاح`
      });

    } catch (error: any) {
      console.error('❌ Error finalizing import session:', error);
      res.status(500).json({
        message: "خطأ في إنهاء جلسة الاستيراد",
        error: error.message
      });
    }
  });


  // Family routes
  app.get("/api/family", authMiddleware, async (req, res) => {
    try {
      // Allow dual-role admin to access their family
      const family = await storage.getFamilyByUserId(req.user!.id);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });

      // Get the user to check their gender
      const user = await storage.getUser(req.user!.id);

      // Get spouse data with appropriate label based on head's gender
      const spouse = family.wifeName
        ? getSpouseDataWithGenderLabel(family, user?.gender || null)
        : null;

      const members = await storage.getMembersByFamilyId(family.id);
      const orphans = await storage.getOrphansByFamilyId(family.id);
      res.json({ ...family, spouse, members, orphans, userGender: user?.gender });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/family", authMiddleware, async (req, res) => {

    try {
      const familyData = insertFamilySchema.parse(req.body);
      familyData.userId = req.user!.id;

      // For head users, check if there's a parent admin who created this head and assign the same branch
      if (req.user!.role === 'head') {
        // Find the user who created this head (if any) and get their branch
        // For now, we'll check if the current head user has a branch assigned from when they were created
        if (req.user!.branch) {
          familyData.branch = req.user!.branch;
        }
      } else if (req.user!.role === 'admin') {
        // If admin has no branch assigned, they can't create families
        if (!req.user!.branch) {
          return res.status(403).json({ message: "لا يمكن إنشاء عائلة: المشرف غير مخصص لفرع" });
        }
        familyData.branch = req.user!.branch;
      }

      const family = await storage.createFamily(familyData);

      // Log the family creation
      await storage.createLog({
        type: 'family_creation',
        message: `تم إنشاء عائلة جديدة ${family.husbandName} من قبل ${req.user!.username}`,
        userId: req.user!.id,
      });

      res.status(201).json(family);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.put("/api/family/:id", authMiddleware, async (req, res) => {
    
    try {
      const id = parseInt(req.params.id);
      const familyData = insertFamilySchema.partial().parse(req.body);
      
      // Check ownership for head users
      if (req.user!.role === 'head') {
        const family = await storage.getFamily(id);
        if (!family || family.userId !== req.user!.id) {
          return res.status(403).json({ message: "غير مصرح لك" });
        }
      }
      
      const family = await storage.updateFamily(id, familyData);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });

      // Log the family update
      await storage.createLog({
        type: 'family_update',
        message: `تم تحديث بيانات عائلة ${family.husbandName} من قبل ${req.user!.username}`,
        userId: req.user!.id,
      });

      res.json(family);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Member routes
  app.get("/api/family/:familyId/members", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      // Allow dual-role admin to access their family
        const family = await storage.getFamily(familyId);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });
      if (isHeadOrDualRole(req.user!, family) && family.userId !== req.user!.id) {
          return res.status(403).json({ message: "غير مصرح لك" });
      }
      const members = await storage.getMembersByFamilyId(familyId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/members", authMiddleware, async (req, res) => {
    try {
      // Allow dual-role admin to add members to their family
        const family = await storage.getFamilyByUserId(req.user!.id);
        if (!family) {
          return res.status(404).json({ message: "العائلة غير موجودة" });
        }
      if (isHeadOrDualRole(req.user!, family)) {
        const memberDataSchema = insertMemberSchema.omit({ familyId: true });
        const parsedData = memberDataSchema.parse(req.body);
        const memberData = { ...parsedData, familyId: family.id };
      const member = await storage.createMember(memberData);

      // Get family info to get head of household's name
      const memberFamily = await storage.getFamily(member.familyId);
      // Log the member creation
      await storage.createLog({
        type: 'member_creation',
        message: `تم إنشاء فرد جديد ${member.fullName} في عائلة ${memberFamily?.husbandName || 'غير معروف'} من قبل ${req.user!.username}`,
        userId: req.user!.id,
      });

      res.status(201).json(member);
      } else {
        return res.status(403).json({ message: "غير مصرح لك" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.put("/api/members/:id", authMiddleware, async (req, res) => {

  try {
    const id = parseInt(req.params.id);
    const memberData = insertMemberSchema.partial().parse(req.body);
      const member = await storage.getMember(id);
      if (!member) return res.status(404).json({ message: "الفرد غير موجود" });
      const family = await storage.getFamily(member.familyId);
    if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });
    if (isHeadOrDualRole(req.user!, family) && family.userId !== req.user!.id) {
        return res.status(403).json({ message: "غير مصرح لك" });
    }
    const updatedMember = await storage.updateMember(id, memberData);
    if (!updatedMember) return res.status(404).json({ message: "الفرد غير موجود" });

    // Don't update family statistics - keep them as stored
    // The family statistics will remain unchanged

      // Get family info to get head of household's name
      const memberFamily = await storage.getFamily(updatedMember.familyId);
      // Log the member update
      await storage.createLog({
        type: 'member_update',
        message: `تم تحديث بيانات الفرد ${updatedMember.fullName} في عائلة ${memberFamily?.husbandName || 'غير معروف'} من قبل ${req.user!.username}`,
        userId: req.user!.id,
      });

    res.json(updatedMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
    }
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});


  app.delete("/api/members/:id", authMiddleware, async (req, res) => {

  try {
    const id = parseInt(req.params.id);
    console.log('Server: Attempting to delete member with ID:', id);
    console.log('Server: ID type:', typeof id);

    // 🔒 تحقق من الملكية إذا كان المستخدم "رب أسرة"
    if (req.user!.role === 'head') {
      const member = await storage.getMember(id);
      console.log('Server: Found member:', member);
      
      if (!member) {
        console.log('Server: Member not found for ID:', id);
        return res.status(404).json({ message: "الفرد غير موجود" });
      }

      const family = await storage.getFamily(member.familyId);
      console.log('Server: Found family:', family);
      
      if (!family || family.userId !== req.user!.id) {
        console.log('Server: Forbidden - family not found or user mismatch');
        return res.status(403).json({ message: "غير مصرح لك" });
    }

      // 🗑️ تنفيذ الحذف بعد التأكد من الصلاحيات
      // Use the member variable already fetched above for permissions check
      const success = await storage.deleteMember(id);
      console.log('Server: Delete result:', success);

      if (!success) {
        console.log('Server: Delete failed for ID:', id);
        return res.status(404).json({ message: "الفرد غير موجود" });
      }

      // Don't update family statistics - keep them as stored
      // The family statistics will remain unchanged

      // Get family info to get head of household's name
      const memberFamily = await storage.getFamily(member.familyId);
      // Log the member deletion
      await storage.createLog({
        type: 'member_deletion',
        message: `تم حذف الفرد ${member.fullName || 'غير معروف'} في عائلة ${memberFamily?.husbandName || 'غير معروف'} من قبل ${req.user!.username}`,
        userId: req.user!.id,
      });

    res.sendStatus(204);
    } else {
      // For admin users, just delete directly
      const member = await storage.getMember(id); // Get member info for logging
      const success = await storage.deleteMember(id);
      if (!success) {
        return res.status(404).json({ message: "الفرد غير موجود" });
      }

      // Get family info to get head of household's name
      const memberFamily = await storage.getFamily(member.familyId);
      // Log the admin member deletion
      await storage.createLog({
        type: 'admin_member_deletion',
        message: `تم حذف الفرد ${member?.fullName || 'غير معروف'} في عائلة ${memberFamily?.husbandName || 'غير معروف'} من قبل المشرف ${req.user!.username}`,
        userId: req.user!.id,
      });

      res.sendStatus(204);
    }
  } catch (error: any) {
    console.error('Server: Error deleting member:', error);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
 });

  // Orphan routes
  app.get("/api/family/:familyId/orphans", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      // Allow dual-role admin to access their family
        const family = await storage.getFamily(familyId);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });
      if (isHeadOrDualRole(req.user!, family) && family.userId !== req.user!.id) {
          return res.status(403).json({ message: "غير مصرح لك" });
      }
      const orphans = await storage.getOrphansByFamilyId(familyId);
      res.json(orphans);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Image upload handler for orphans
  app.post("/api/orphans/upload", authMiddleware, orphanUpload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم تحميل أي صورة" });
      }

      // Check file size to ensure it's within limits
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: "حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت" });
      }

      // Convert image to base64
      const imageBuffer = req.file.buffer;
      const imageBase64 = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

      res.json({ image: imageBase64 });
    } catch (error: any) {
      if (error.message && error.message.includes('File too large')) {
        return res.status(400).json({ message: "حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت" });
      }
      console.error('Image upload error:', error);
      res.status(500).json({ message: "خطأ في تحميل الصورة" });
    }
  });

  app.post("/api/orphans", authMiddleware, async (req, res) => {
    try {
      // Allow dual-role admin to add orphans to their family
      const userFamily = await storage.getFamilyByUserId(req.user!.id);
      if (!userFamily) {
        return res.status(404).json({ message: "العائلة غير موجودة" });
      }
      if (isHeadOrDualRole(req.user!, userFamily)) {
        const orphanDataSchema = insertOrphanSchema.omit({ familyId: true });
        const parsedData = orphanDataSchema.parse(req.body);
        const orphanData = { ...parsedData, familyId: userFamily.id };
        const orphan = await storage.createOrphan(orphanData);

        // Get family info to get head of household's name
        const family = await storage.getFamily(orphan.familyId);
        // Log the orphan creation
        await storage.createLog({
          type: 'orphan_creation',
          message: `تم إنشاء يتيم جديد ${orphan.orphanName || 'غير معروف'} في عائلة ${family?.husbandName || 'غير معروف'} من قبل ${req.user!.username}`,
          userId: req.user!.id,
        });

        res.status(201).json(orphan);
      } else {
        return res.status(403).json({ message: "غير مصرح لك" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      console.error('Orphan creation error:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.put("/api/orphans/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orphanData = insertOrphanSchema.partial().extend({
        orphanID: z.string().regex(/^\d{9}$/, "رقم هوية اليتيم يجب أن يكون 9 أرقام").optional(),
        guardianID: z.string().regex(/^\d{9}$/, "رقم هوية الوصي يجب أن يكون 9 أرقام").optional(),
        fatherID: z.string().regex(/^\d{9}$/, "رقم هوية الاب يجب أن يكون 9 أرقام").optional(),
        mobileNumber: z.string().regex(/^\d{10}$/, "رقم الجوال يجب أن يكون 10 أرقام").optional(),
        backupMobileNumber: z.string().regex(/^\d{10}$/, "رقم الجوال الاحتياطي يجب أن يكون 10 أرقام").optional(),
        martyrdomType: z.enum(['war_2023', 'pre_2023_war', 'natural_death']).optional(),
      }).parse(req.body);
      const orphan = await storage.getOrphan(id);
      if (!orphan) return res.status(404).json({ message: "اليتيم غير موجود" });
      const family = await storage.getFamily(orphan.familyId);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });
      if (isHeadOrDualRole(req.user!, family) && family.userId !== req.user!.id) {
          return res.status(403).json({ message: "غير مصرح لك" });
      }
      const updatedOrphan = await storage.updateOrphan(id, orphanData);
      if (!updatedOrphan) return res.status(404).json({ message: "اليتيم غير موجود" });

      // Get family info to get head of household's name
      const familyForLogging = await storage.getFamily(updatedOrphan.familyId);
      // Log the orphan update
      await storage.createLog({
        type: 'orphan_update',
        message: `تم تحديث بيانات اليتيم ${updatedOrphan.orphanName || 'غير معروف'} في عائلة ${familyForLogging?.husbandName || 'غير معروف'} من قبل ${req.user!.username}`,
        userId: req.user!.id,
      });

      res.json(updatedOrphan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.delete("/api/orphans/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log('Server: Attempting to delete orphan with ID:', id);
      console.log('Server: ID type:', typeof id);

      // 🔒 Check ownership if user is a "head"
      if (req.user!.role === 'head') {
        const orphan = await storage.getOrphan(id);
        console.log('Server: Found orphan:', orphan);

        if (!orphan) {
          console.log('Server: Orphan not found for ID:', id);
          return res.status(404).json({ message: "اليتيم غير موجود" });
        }

        const family = await storage.getFamily(orphan.familyId);
        console.log('Server: Found family:', family);

        if (!family || family.userId !== req.user!.id) {
          console.log('Server: Forbidden - family not found or user mismatch');
          return res.status(403).json({ message: "غير مصرح لك" });
        }

        // 🗑️ Execute deletion after permissions are verified
        // Use the orphan variable already fetched above for permissions check
        const success = await storage.deleteOrphan(id);
        console.log('Server: Delete result:', success);

        if (!success) {
          console.log('Server: Delete failed for ID:', id);
          return res.status(404).json({ message: "اليتيم غير موجود" });
        }

        // Get family info to get head of household's name
        const orphanFamily = await storage.getFamily(orphan.familyId);
        // Log the orphan deletion
        await storage.createLog({
          type: 'orphan_deletion',
          message: `تم حذف اليتيم ${orphan.orphanName || 'غير معروف'} في عائلة ${orphanFamily?.husbandName || 'غير معروف'} من قبل ${req.user!.username}`,
          userId: req.user!.id,
        });

      res.sendStatus(204);
      } else {
        // For admin users, just delete directly
        const orphan = await storage.getOrphan(id); // Get orphan info for logging
        const success = await storage.deleteOrphan(id);
        if (!success) {
          return res.status(404).json({ message: "اليتيم غير موجود" });
        }

        // Get family info to get head of household's name
        const orphanFamily = await storage.getFamily(orphan.familyId);
        // Log the admin orphan deletion
        await storage.createLog({
          type: 'admin_orphan_deletion',
          message: `تم حذف اليتيم ${orphan?.orphanName || 'غير معروف'} في عائلة ${orphanFamily?.husbandName || 'غير معروف'} من قبل المشرف ${req.user!.username}`,
          userId: req.user!.id,
        });

        res.sendStatus(204);
      }
    } catch (error: any) {
      console.error('Server: Error deleting orphan:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Spouse routes - now stored in families table with gender-appropriate labels
  app.get("/api/family/:familyId/spouse", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const family = await storage.getFamily(familyId);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });

      if (isHeadOrDualRole(req.user!, family) && family.userId !== req.user!.id) {
        return res.status(403).json({ message: "غير مصرح لك" });
      }

      // Get the user to check their gender
      const user = await storage.getUser(family.userId);

      // Return spouse data with appropriate label based on head's gender
      const spouseData = family.wifeName
        ? getSpouseDataWithGenderLabel(family, user?.gender || null)
        : null;

      res.json(spouseData);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/family/:familyId/spouse", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const family = await storage.getFamily(familyId);
      if (!family) {
        return res.status(404).json({ message: "العائلة غير موجودة" });
      }

      if (isHeadOrDualRole(req.user!, family) && family.userId !== req.user!.id) {
        return res.status(403).json({ message: "غير مصرح لك" });
      }

      // Check if spouse already exists for this family (if wifeName is already set)
      if (family.wifeName) {
        return res.status(409).json({ message: "الزوج/الزوجة موجود/ة مسبقاً لهذه العائلة" });
      }

      // Use the original schema parsing but adapt to work with family updates
      const { spouseName, spouseID, spouseBirthDate, spouseJob, spousePregnant } = req.body;

      // Update the family with spouse data (stored as wife fields in DB for compatibility)
      const updatedFamily = await storage.updateFamily(familyId, {
        wifeName: spouseName,
        wifeID: spouseID,
        wifeBirthDate: spouseBirthDate,
        wifeJob: spouseJob,
        wifePregnant: spousePregnant || false
      });

      if (!updatedFamily) {
        return res.status(404).json({ message: "العائلة غير موجودة" });
      }

      // Get the user to check their gender
      const user = await storage.getUser(family.userId);

      // Return the spouse data with appropriate label based on head's gender
      const spouseData = getSpouseDataWithGenderLabel(updatedFamily, user?.gender || null);

      res.status(201).json(spouseData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.put("/api/family/:familyId/spouse", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const family = await storage.getFamily(familyId);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });

      if (isHeadOrDualRole(req.user!, family) && family.userId !== req.user!.id) {
        return res.status(403).json({ message: "غير مصرح لك" });
      }

      // Check if spouse record exists (if no spouse data, this is a 404)
      if (!family.wifeName) {
        return res.status(404).json({ message: "الزوج/الزوجة غير موجود/ة" });
      }

      // Use the original schema but adapt to work with family updates
      const { spouseName, spouseID, spouseBirthDate, spouseJob, spousePregnant } = req.body;

      // Update the family with spouse data
      const updatedFamily = await storage.updateFamily(familyId, {
        wifeName: spouseName !== undefined ? spouseName : family.wifeName,
        wifeID: spouseID !== undefined ? spouseID : family.wifeID,
        wifeBirthDate: spouseBirthDate !== undefined ? spouseBirthDate : family.wifeBirthDate,
        wifeJob: spouseJob !== undefined ? spouseJob : family.wifeJob,
        wifePregnant: spousePregnant !== undefined ? spousePregnant : family.wifePregnant
      });

      if (!updatedFamily) return res.status(404).json({ message: "الزوج/الزوجة غير موجود/ة" });

      // Get the user to check their gender
      const user = await storage.getUser(family.userId);

      // Return the updated spouse data with appropriate label based on head's gender
      const spouseData = getSpouseDataWithGenderLabel(updatedFamily, user?.gender || null);

      // Log the spouse update
      await storage.createLog({
        type: 'spouse_update',
        message: `تم تحديث بيانات الزوج/الزوجة لعائلة ${updatedFamily.husbandName} من قبل ${req.user!.username}`,
        userId: req.user!.id,
      });

      res.json(spouseData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.delete("/api/family/:familyId/spouse", authMiddleware, async (req, res) => {
    try {
      const familyId = parseInt(req.params.familyId);
      const family = await storage.getFamily(familyId);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });

      if (isHeadOrDualRole(req.user!, family) && family.userId !== req.user!.id) {
        return res.status(403).json({ message: "غير مصرح لك" });
      }

      // Check if spouse data exists (if no wifeName, this is a 404)
      if (!family.wifeName) return res.status(404).json({ message: "الزوج/الزوجة غير موجود/ة" });

      // Clear spouse data from the family record instead of deleting a separate row
      const result = await db.update(families).set({
        wifeName: null,
        wifeID: null,
        wifeBirthDate: null,
        wifeJob: null,
        wifePregnant: false,
      }).where(eq(families.id, familyId));

      if (result.rowCount === 0) return res.status(404).json({ message: "الزوج/الزوجة غير موجود/ة" });

      res.sendStatus(204);
    } catch (error) {
      console.error('Server: Error deleting spouse:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Request routes
  app.get("/api/requests", authMiddleware, async (req, res) => {
    try {
      // Allow dual-role admin to fetch their family's requests
      const family = await storage.getFamilyByUserId(req.user!.id);
      if (isHeadOrDualRole(req.user!, family)) {
        if (!family) return res.json([]);
        const requests = await storage.getRequestsByFamilyId(family.id);
        res.json(requests);
      } else {
        // For admin/root users, apply branch filtering
        // Root users can see all requests
        // Admin users only see requests from families in their branch
        const branchFilter = req.user!.role === 'root' ? undefined : (req.user!.branch || null);

        // Get all families based on branch filter
        const families = await storage.getAllFamilies(branchFilter);

        // Get requests for those families only
        const allRequests = await storage.getAllRequests();

        // Filter requests to only include those from allowed families
        const allowedFamilyIds = new Set(families.map(f => f.id));
        const filteredRequests = allRequests.filter(req => allowedFamilyIds.has(req.familyId));

        // Get the family data for each request
        const familyMap = new Map(families.map(family => [family.id, family]));
        const requestsWithFamily = filteredRequests.map(request => ({
          ...request,
          family: familyMap.get(request.familyId)!
        }));

        res.json(requestsWithFamily);
      }
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/requests", authMiddleware, async (req, res) => {
    
    try {
      let requestData;
      
      const family = await storage.getFamilyByUserId(req.user!.id);
      if (isHeadOrDualRole(req.user!, family)) {
        // For head users, omit familyId from validation since it's set automatically
        const requestDataSchema = insertRequestSchema.omit({ familyId: true });
        requestData = requestDataSchema.parse(req.body);
        
        if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });
        
        // Add familyId from user's family
        requestData = { ...requestData, familyId: family.id };
      } else {
        // For admin users, validate with familyId included
        requestData = insertRequestSchema.parse(req.body);
      }
      
      const request = await storage.createRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.put("/api/requests/:id", authMiddleware, async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);
    
    try {
      const id = parseInt(req.params.id);
      const requestData = insertRequestSchema.partial().parse(req.body);
      
      // Get the original request to check for changes
      const originalRequest = await storage.getRequest(id);
      if (!originalRequest) return res.status(404).json({ message: "الطلب غير موجود" });
      
      const request = await storage.updateRequest(id, requestData);
      if (!request) return res.status(404).json({ message: "الطلب غير موجود" });

      // Move variable declarations before usage
      const statusChanged = originalRequest.status !== request.status;
      const commentAdded = !originalRequest.adminComment && request.adminComment;
      const commentChanged = originalRequest.adminComment !== request.adminComment;
      
      // Get family information for notification
      const family = await getFamilyByIdOrDualRole(request.familyId, req.user);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });

      console.log('[Notification Debug]', {
        requestId: request.id,
        familyId: request.familyId,
        familyUserId: family.userId,
        action: statusChanged ? 'statusChanged' : (commentAdded || commentChanged) ? 'comment' : 'none',
        notificationRecipients: [family.userId]
      });
      
      // Send notifications based on changes
      if (statusChanged) {
        // Status changed - send approval/rejection notification
        const statusText = request.status === 'approved' ? 'تمت الموافقة' : 
                          request.status === 'rejected' ? 'تم الرفض' : 'تم التحديث';
        
        await storage.createNotification({
          title: `تحديث حالة الطلب #${request.id}`,
          message: `تم ${statusText} على طلبك من نوع "${getRequestTypeInArabic(request.type)}". ${request.adminComment ? `التعليق: ${request.adminComment}` : ''}`,
          target: 'specific',
          recipients: [family.userId]
        });
      } else if (commentAdded || commentChanged) {
        // Only comment changed - send comment notification
        await storage.createNotification({
          title: `تعليق إداري على الطلب #${request.id}`,
          message: `تم إضافة تعليق إداري على طلبك من نوع "${getRequestTypeInArabic(request.type)}": ${request.adminComment}`,
          target: 'specific',
          recipients: [family.userId]
        });
      }
      
      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Notification routes
  app.get("/api/notifications", authMiddleware, async (req, res) => {
    try {
      let notifications = await storage.getAllNotifications();
      if (req.user!.role === 'head') {
        // Only show notifications relevant to this head
        notifications = notifications.filter(n =>
          n.target === 'all' ||
          n.target === 'head' ||
          n.target === 'urgent' ||
          (n.target === 'specific' && Array.isArray(n.recipients) && n.recipients.includes(req.user!.id))
        );
      }
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/notifications", authMiddleware, async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);
    
    try {
      let notificationData = insertNotificationSchema.parse(req.body);

      // If target is 'admin', set recipients to all admin user IDs
      if (notificationData.target === 'admin') {
        const admins = await storage.getAllUsers?.() || []; // If you have a getAllUsers method
        const adminIds = admins.filter((u: any) => u.role === 'admin').map((u: any) => u.id);
        notificationData = {
          ...notificationData,
          recipients: adminIds,
        };
      }

      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Mark notification as read route
  app.post("/api/notifications/:id/read", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.markNotificationAsRead(id, req.user!.id);
      if (result) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ message: "التنبيه غير موجود أو لا يمكن تحديده كمقروء" });
      }
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Get unread notifications count
  app.get("/api/notifications/unread-count", authMiddleware, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationsCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin routes
  app.get("/api/admin/families", authMiddleware, async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);

    try {
      // Filter by branch if the user is an admin (not root)
      // Root users can see all families (branchFilter will be undefined)
      // Admin users only see families from their branch (if assigned)
      const branchFilter = req.user!.role === 'root' ? undefined : (req.user!.branch || null);
      const families = await storage.getAllFamiliesWithMembersAndRequestsOptimized(branchFilter);
      // For each family, get the user and add gender-appropriate spouse data
      const familiesWithGenderAppropriateSpouse = await Promise.all(families.map(async (family) => {
        const user = await storage.getUser(family.userId);
        const spouse = family.wifeName
          ? getSpouseDataWithGenderLabel(family, user?.gender || null)
          : null;
        return { ...family, spouse, userGender: user?.gender };
      }));
      res.json(familiesWithGenderAppropriateSpouse);
    } catch (error) {
      console.error('Families endpoint error:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/admin/families/:id", authMiddleware, async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const family = await getFamilyByIdOrDualRole(id, req.user);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });

      // Get the user to check their gender
      const user = await storage.getUser(family.userId);

      // Get spouse data with appropriate label based on head's gender
      const spouse = family.wifeName
        ? getSpouseDataWithGenderLabel(family, user?.gender || null)
        : null;

      const members = await storage.getMembersByFamilyId(family.id);
      const orphans = await storage.getOrphansByFamilyId(family.id);
      const requests = await storage.getRequestsByFamilyId(family.id);
      res.json({ ...family, spouse, members, orphans, requests, userGender: user?.gender });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.put("/api/admin/families/:id", authMiddleware, async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const familyData = insertFamilySchema.partial().parse(req.body);
      // Use getFamilyByIdOrDualRole to check existence before update
      const family = await getFamilyByIdOrDualRole(id, req.user);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });
      const updatedFamily = await storage.updateFamily(id, familyData);
      if (!updatedFamily) return res.status(404).json({ message: "العائلة غير موجودة" });

      // Log the admin family update
      await storage.createLog({
        type: 'admin_family_update',
        message: `تم تحديث بيانات عائلة ${updatedFamily.husbandName} من قبل المشرف ${req.user!.username}`,
        userId: req.user!.id,
      });

      res.json(updatedFamily);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.delete("/api/admin/families/:id", authMiddleware, async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const family = await storage.getFamily(id); // Get family info for logging
      const success = await storage.deleteFamily(id);
      if (!success) return res.status(404).json({ message: "العائلة غير موجودة" });

      // Log the family deletion
      await storage.createLog({
        type: 'family_deletion',
        message: `تم حذف عائلة ${id} (رب الأسرة: ${family?.husbandName || 'غير معروف'}) من قبل المشرف ${req.user!.username}`,
        userId: req.user!.id,
      });

      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin: Get all orphans
  app.get("/api/admin/orphans", authMiddleware, async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);

    try {
      // Apply branch filtering for admin users
      const branchFilter = req.user!.role === 'root' ? undefined : (req.user!.branch || null);

      // Get all families based on branch filter
      const families = await storage.getAllFamilies(branchFilter);

      // Get all orphans
      const allOrphans = await storage.getAllOrphans();

      // Filter orphans to only include those from allowed families
      const allowedFamilyIds = new Set(families.map(f => f.id));
      const filteredOrphans = allOrphans.filter(orphan => allowedFamilyIds.has(orphan.familyId));

      // For each orphan, get the associated family data and count of orphans under 18 in the family
      const orphansWithFamily = await Promise.all(filteredOrphans.map(async (orphan) => {
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
            orphansUnder18Count: orphansUnder18Count
          };
        } catch (familyError) {
          console.error(`Error getting family for orphan ${orphan.id} with familyId ${orphan.familyId}:`, familyError);
          const orphansUnder18Count = await storage.getOrphansCountUnder18ByFamilyId(orphan.familyId);
          return {
            ...orphan,
            family: null,
            orphansUnder18Count: orphansUnder18Count
          };
        }
      }));

      res.json(orphansWithFamily);
    } catch (error) {
      console.error('Admin orphans endpoint error:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin: Create orphan
  app.post("/api/admin/orphans", authMiddleware, async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);

    try {
      const orphanData = insertOrphanSchema.parse(req.body);
      const orphan = await storage.createOrphan(orphanData);

      // Get family info to get head of household's name
      const family = await storage.getFamily(orphan.familyId);
      // Log the admin orphan creation
      await storage.createLog({
        type: 'admin_orphan_creation',
        message: `تم إنشاء يتيم جديد في عائلة ${family?.husbandName || 'غير معروف'} من قبل المشرف ${req.user!.username}`,
        userId: req.user!.id,
      });

      res.status(201).json(orphan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin: Update orphan
  app.put("/api/admin/orphans/:id", authMiddleware, async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);

    try {
      const id = parseInt(req.params.id);
      const orphanData = insertOrphanSchema.partial().parse(req.body);
      const orphan = await storage.updateOrphan(id, orphanData);

      if (!orphan) return res.status(404).json({ message: "اليتيم غير موجود" });

      // Get family info to get head of household's name
      const family = await storage.getFamily(orphan.familyId);
      // Log the admin orphan update
      await storage.createLog({
        type: 'admin_orphan_update',
        message: `تم تحديث بيانات اليتيم ${orphan.orphanName || 'غير معروف'} في عائلة ${family?.husbandName || 'غير معروف'} من قبل المشرف ${req.user!.username}`,
        userId: req.user!.id,
      });

      res.json(orphan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin: Upload orphan image
  app.post("/api/admin/orphans/upload", authMiddleware, orphanUpload.single("image"), async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم تحميل أي صورة" });
      }

      // Check file size to ensure it's within limits
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: "حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت" });
      }

      // Convert image to base64
      const imageBuffer = req.file.buffer;
      const imageBase64 = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

      res.json({ image: imageBase64 });
    } catch (error: any) {
      if (error.message && error.message.includes('File too large')) {
        return res.status(400).json({ message: "حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت" });
      }
      console.error('Image upload error:', error);
      res.status(500).json({ message: "خطأ في تحميل الصورة" });
    }
  });

  // Admin: Delete orphan
  app.delete("/api/admin/orphans/:id", authMiddleware, async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);

    try {
      const id = parseInt(req.params.id);
      const orphan = await storage.getOrphan(id); // Get orphan info for logging
      const success = await storage.deleteOrphan(id);

      if (!success) return res.status(404).json({ message: "اليتيم غير موجود" });

      // Log the admin orphan deletion
      await storage.createLog({
        type: 'admin_orphan_deletion',
        message: `تم حذف اليتيم ${orphan?.orphanName || 'غير معروف'} (ID: ${orphan?.id}) في العائلة ${orphan?.familyId} من قبل المشرف ${req.user!.username}`,
        userId: req.user!.id,
      });

      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/admin/families/:id/members", authMiddleware, async (req, res) => {
  if (req.user!.role === 'head') return res.sendStatus(403);
  try {
    const familyId = parseInt(req.params.id);
      const family = await getFamilyByIdOrDualRole(familyId, req.user);
      if (!family) return res.status(404).json({ message: "العائلة غير موجودة" });
    const memberData = { ...insertMemberSchema.omit({ familyId: true }).parse(req.body), familyId };
    const member = await storage.createMember(memberData);

      // Get family info to get head of household's name
      const memberFamily = await storage.getFamily(member.familyId);
      // Log the admin member creation
      await storage.createLog({
        type: 'admin_member_creation',
        message: `تم إنشاء فرد جديد ${member.fullName} في عائلة ${memberFamily?.husbandName || 'غير معروف'} من قبل المشرف ${req.user!.username}`,
        userId: req.user!.id,
      });

    res.status(201).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
    }
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

  // Registration route for family heads
  app.post("/api/register-family", authMiddleware, async (req, res) => {
  try {
      const { user: userData, family: familyData, members: membersData } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByNationalId(familyData.husbandID);
      if (existingUser) {
        return res.status(400).json({ message: "رقم الهوية مسجل مسبقاً" });
      }

      // Check if the current user is an admin to assign branch
      let userBranch = null;
      if (req.user!.role === 'admin') {
        // If admin has no branch assigned, they can't create families
        if (!req.user!.branch) {
          return res.status(403).json({ message: "لا يمكن إنشاء عائلة: المشرف غير مخصص لفرع" });
        }
        userBranch = req.user!.branch;
      }

      // Create user
      const user = await storage.createUser({
        username: familyData.husbandID,
        password: userData.password ? await hashPassword(userData.password) : await hashPassword(familyData.husbandID),
        role: 'head',
        gender: userData.gender || 'male', // Add gender field, default to 'male' for backward compatibility
        phone: familyData.primaryPhone,
        branch: userBranch // Assign the same branch as the creating admin
      });

      // Create family with the same branch as the user
      const family = await storage.createFamily({
        ...familyData,
        userId: user.id,
        branch: userBranch // Assign the same branch as the user/admin
      });
      
      // Create members if provided
      if (membersData && membersData.length > 0) {
        for (const memberData of membersData) {
          await storage.createMember({
            ...memberData,
            familyId: family.id
          });
        }
      }
      
      // Only log in the user if they provided a password (self-registration)
      // If no password provided, this is admin creating a head, so don't auto-login
      if (userData.password) {
        try {
          const { generateToken } = await import('./jwt-auth');
          const token = generateToken(user);
          res.status(201).json({ token, user, family });
        } catch (err) {
          console.error('Token generation error:', err);
          return res.status(500).json({ message: "تم التسجيل بنجاح لكن فشل تسجيل الدخول" });
        }
      } else {
        // Admin creating head - don't auto-login
        res.status(201).json({ user, family });
      }
    } catch (error: any) {
    if (error.code === "23505") {
      return res.status(400).json({ message: "رقم الهوية مسجل مسبقاً" });
    }
    console.error("Registration error:", error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Profile: Get current user profile (excluding password)
  app.get("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
      // Exclude password from response
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Profile: Update user profile (including gender)
  app.put("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const { gender } = req.body;

      // Validate gender if provided
      if (gender && !['male', 'female', 'other'].includes(gender)) {
        return res.status(400).json({ message: "الجنس غير صحيح" });
      }

      const user = await storage.updateUser(req.user!.id, { gender });
      if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

      // Exclude password from response
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Profile: Change password
  app.post("/api/user/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "الرجاء إدخال كلمة المرور الحالية والجديدة" });
  }
  try {
    const user = await storage.getUser(req.user!.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const valid = await comparePasswords(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة" });
    }

    const hashed = await hashPassword(newPassword);
    await storage.updateUser(user.id, { password: hashed });
    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور" });
  }
  });

  // Admin: Get all users
  app.get("/api/admin/users", authMiddleware, async (req, res) => {
    if (req.user!.role === 'head') return res.sendStatus(403);
    try {
      const users = await storage.getAllUsers({ includeDeleted: true });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin: Create user
  app.post("/api/admin/users", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root') return res.sendStatus(403);
    try {
      let userData = req.body;
      // Validate password if provided
      if (userData.password) {
        // Fetch password policy settings
        const settings = await storage.getAllSettings();
        const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
        const minLength = parseInt(settingsMap.minPasswordLength || "8");
        const requireUppercase = settingsMap.requireUppercase === "true";
        const requireLowercase = settingsMap.requireLowercase === "true";
        const requireNumbers = settingsMap.requireNumbers === "true";
        const requireSpecialChars = settingsMap.requireSpecialChars === "true";
        const errors = [];
        if (userData.password.length < minLength) {
          errors.push(`كلمة المرور يجب أن تكون ${minLength} أحرف على الأقل`);
        }
        if (requireUppercase && !/[A-Z]/.test(userData.password)) {
          errors.push("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل");
        }
        if (requireLowercase && !/[a-z]/.test(userData.password)) {
          errors.push("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل");
        }
        if (requireNumbers && !/\d/.test(userData.password)) {
          errors.push("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل");
        }
        if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(userData.password)) {
          errors.push("كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل");
        }
        if (errors.length > 0) {
          return res.status(400).json({ message: errors.join("، ") });
        }
        userData.password = await hashPassword(userData.password);
      }
      // Only allow certain fields to be set
      const allowedFields = ['username', 'password', 'role', 'phone', 'gender', 'isProtected', 'identityId'];
      userData = Object.fromEntries(Object.entries(userData).filter(([k]) => allowedFields.includes(k)));
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin: Update user
  app.put("/api/admin/users/:id", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root' && req.user!.role !== 'admin') return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      let userData = req.body;
      // Fetch the target user
      const targetUser = await storage.getUser(id);
      if (!targetUser) return res.status(404).json({ message: "المستخدم غير موجود" });

      // Root can edit anyone, including isProtected
      if (req.user!.role === 'root') {
      if (!userData.username) {
          userData.username = targetUser.username;
      }
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) return res.status(404).json({ message: "المستخدم غير موجود" });
        return res.json(updatedUser);
      }
      // Admin logic (protected or not)
      if (req.user!.role === 'admin') {
        // Prevent admin from editing root
        if (targetUser.role === 'root') {
          return res.status(403).json({ message: "لا يمكن للمشرفين تعديل المشرف الرئيسي." });
        }
        // Prevent admin from editing protected admins unless current admin is protected and target is not
        if (targetUser.role === 'admin' && targetUser.isProtected) {
          return res.status(403).json({ message: "لا يمكن للمشرفين تعديل مشرف محمي." });
        }
        // Allow protected admin to edit unprotected admin or head
        if (req.user!.isProtected) {
          if (targetUser.role === 'admin' && !targetUser.isProtected) {
            // ok
          } else if (targetUser.role === 'head') {
            // ok
          } else {
            return res.status(403).json({ message: "غير مسموح بتعديل هذا المستخدم." });
          }
        } else {
          // Unprotected admin can only edit heads and unprotected admins
        if (targetUser.role !== 'head' && !(targetUser.role === 'admin' && !targetUser.isProtected)) {
          return res.status(403).json({ message: "غير مسموح بتعديل هذا المستخدم." });
          }
        }
        // Prevent admin from changing isProtected
        if ('isProtected' in userData) {
          delete userData.isProtected;
        }
        // Prevent admin from changing role (but allow gender changes)
        userData.role = targetUser.role; // cannot change role
        if (!userData.username) {
          userData.username = targetUser.username;
        }
        const updatedUser = await storage.updateUser(id, userData);
        if (!updatedUser) return res.status(404).json({ message: "المستخدم غير موجود" });
        return res.json(updatedUser);
      }
      return res.sendStatus(403);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin: Delete user
  app.delete("/api/admin/users/:id", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root' && req.user!.role !== 'admin') return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const targetUser = await storage.getUser(id);
      if (!targetUser) return res.status(404).json({ message: "المستخدم غير موجود" });

      // Check for family references
      const families = await storage.getFamiliesByUserId(id);
      const hasFamilies = families && families.length > 0;
      const cascade = req.query.cascade === 'true';
      const hard = req.query.hard === 'true';

      if (hasFamilies && !cascade) {
        // Prevent deletion, return clear error
        return res.status(409).json({
          message: "لا يمكن حذف المستخدم لأنه مرتبط بعائلات. يمكنك اختيار الحذف المتسلسل لحذف جميع العائلات والأفراد المرتبطين بهذا المستخدم.",
          code: "USER_REFERENCED_IN_FAMILY",
          families: families.map(f => ({ id: f.id, husbandName: f.husbandName, husbandID: f.husbandID }))
        });
      }

      // Root can delete anyone except themselves
      if (req.user!.role === 'root') {
        if (targetUser.id === req.user!.id) {
          return res.status(403).json({ message: "لا يمكن حذف حسابك الخاص" });
        }
        // Cascade deletion if requested
        if (hasFamilies && cascade) {
          for (const family of families) {
            await storage.deleteFamily(family.id);
          }
        }
        const success = hard 
          ? await storage.deleteUser(id)
          : await storage.softDeleteUser(id);
        if (!success) return res.status(404).json({ message: "المستخدم غير موجود" });
        return res.sendStatus(204);
      }
      // Admin logic (protected or not)
      if (req.user!.role === 'admin') {
        // Prevent admin from deleting root
        if (targetUser.role === 'root') {
          return res.status(403).json({ message: "لا يمكن للمشرفين حذف المشرف الرئيسي." });
        }
        // Prevent admin from deleting protected admins unless current admin is protected and target is not
        if (targetUser.role === 'admin' && targetUser.isProtected) {
          return res.status(403).json({ message: "لا يمكن للمشرفين حذف مشرف محمي." });
        }
        // Allow protected admin to delete unprotected admin or head
        if (req.user!.isProtected) {
          if (targetUser.role === 'admin' && !targetUser.isProtected) {
            // ok
          } else if (targetUser.role === 'head') {
            // ok
          } else {
            return res.status(403).json({ message: "غير مسموح بحذف هذا المستخدم." });
          }
        } else {
          // Unprotected admin can only delete heads and unprotected admins
          if (targetUser.role !== 'head' && !(targetUser.role === 'admin' && !targetUser.isProtected)) {
            return res.status(403).json({ message: "غير مسموح بحذف هذا المستخدم." });
          }
        }
        // Cascade deletion if requested
        if (hasFamilies && cascade) {
          for (const family of families) {
            await storage.deleteFamily(family.id);
          }
        }
        const success = hard 
          ? await storage.deleteUser(id)
          : await storage.softDeleteUser(id);
        if (!success) return res.status(404).json({ message: "المستخدم غير موجود" });
        return res.sendStatus(204);
      }
      return res.sendStatus(403);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin: Bulk delete all head users
  app.delete("/api/admin/heads", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root' && req.user!.role !== 'admin') return res.sendStatus(403);
    try {
      // Only root or protected admin can perform this operation
      if (req.user!.role === 'admin' && !req.user!.isProtected) {
        return res.status(403).json({ message: "لا يمكن للمشرف غير المحمي حذف كل رؤوس العائلات" });
      }

      await storage.clearHeads();
      res.json({ message: "تم حذف جميع رؤوس العائلات بنجاح" });
    } catch (error) {
      console.error("Error deleting all heads:", error);
      res.status(500).json({ message: "خطأ في الحذف الجماعي لرؤوس العائلات" });
    }
  });

  // Admin: Reset user lockout
  app.post("/api/admin/users/:id/reset-lockout", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root' && req.user!.role !== 'admin') return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      const targetUser = await storage.getUser(id);
      if (!targetUser) return res.status(404).json({ message: "المستخدم غير موجود" });

      // Root can reset anyone
      if (req.user!.role === 'root') {
        await storage.updateUser(id, {
          failedLoginAttempts: 0,
          lockoutUntil: null
        });
        return res.json({ message: "تم إعادة تعيين حظر الحساب بنجاح" });
      }

      // Admin can reset heads and unprotected admins
      if (req.user!.role === 'admin') {
        // Prevent admin from resetting root
        if (targetUser.role === 'root') {
          return res.status(403).json({ message: "لا يمكن للمشرفين إعادة تعيين حظر المشرف الرئيسي." });
        }
        // Prevent admin from resetting protected admins
        if (targetUser.role === 'admin' && targetUser.isProtected) {
          return res.status(403).json({ message: "لا يمكن للمشرفين إعادة تعيين حظر مشرف محمي." });
        }
        // Admin can only reset heads and unprotected admins
        if (targetUser.role !== 'head' && !(targetUser.role === 'admin' && !targetUser.isProtected)) {
          return res.status(403).json({ message: "غير مسموح بإعادة تعيين حظر هذا المستخدم." });
        }
        await storage.updateUser(id, {
          failedLoginAttempts: 0,
          lockoutUntil: null
        });
        return res.json({ message: "تم إعادة تعيين حظر الحساب بنجاح" });
      }

      // Fallback forbidden
      return res.sendStatus(403);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Restore soft-deleted user
  app.post("/api/admin/users/:id/restore", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root') return res.sendStatus(403);
    try {
      const id = parseInt(req.params.id);
      // Only allow restoring if user is soft-deleted
      const user = await storage.getUser(id, { includeDeleted: true });
      if (!user || !user.deletedAt) return res.status(404).json({ message: "المستخدم غير موجود أو غير محذوف" });
      const success = await storage.restoreUser(id);
      if (!success) return res.status(500).json({ message: "فشل في الاستعادة" });
      res.json({ message: "تم استعادة المستخدم" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin: Get logs
  app.get("/api/admin/logs", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root' && req.user!.role !== 'admin') return res.sendStatus(403);
    try {
      const { page = 1, pageSize = 20, type, userId, search, startDate, endDate } = req.query;
      const limit = Math.max(1, Math.min(Number(pageSize) || 20, 100));
      const offset = (Number(page) - 1) * limit;
      const logs = await storage.getLogs({
        type: type as string | undefined,
        userId: userId ? Number(userId) : undefined,
        search: search as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        limit,
        offset,
      });
      // Get only the user IDs that are actually referenced in the logs (more efficient than getting all users)
      const userIds = [...new Set(logs.map(log => log.userId).filter(Boolean) as number[])];
      const users = userIds.length > 0 ? await storage.getUsersByIds(userIds) : [];
      const usersMap = Object.fromEntries(users.map(u => [u.id, u]));
      const logsWithUser = logs.map(log => ({ ...log, user: usersMap[log.userId] || null }));
      res.json(logsWithUser);
    } catch (error) {
      console.error('Error in GET /api/admin/logs:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin: Get log statistics
  app.get("/api/admin/logs/statistics", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root' && req.user!.role !== 'admin') return res.sendStatus(403);
    try {
      const { startDate, endDate } = req.query;
      const stats = await storage.getLogStatistics(
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.json(stats);
    } catch (error) {
      console.error('Error in GET /api/admin/logs/statistics:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Admin: Create log (optional, for manual log creation)
  app.post("/api/admin/logs", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root' && req.user!.role !== 'admin') return res.sendStatus(403);
    try {
      const logData = req.body;
      logData.userId = req.user!.id;
      const log = await storage.createLog(logData);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
  }
  });

  // Settings routes
  app.get("/api/settings", authMiddleware, async (req, res) => {
    try {
      const allSettings = await storage.getAllSettings();
      const settingsMap = Object.fromEntries(allSettings.map(s => [s.key, s.value]));
      res.json(settingsMap);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Public settings route - no authentication required
  app.get("/api/public/settings", async (req, res) => {
    try {
      const allSettings = await storage.getAllSettings();
      const settingsMap = Object.fromEntries(allSettings.map(s => [s.key, s.value]));
      res.json(settingsMap);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/settings", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root') return res.sendStatus(403);
    try {
      const { key, value, description } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ message: "المفتاح والقيمة مطلوبان" });
      }
      await storage.setSetting(key, value, description);
      res.json({ message: "تم تحديث الإعداد بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Bulk settings save endpoint
  app.post("/api/settings/bulk", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root') return res.sendStatus(403);
    try {
      const { settings } = req.body;
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ message: "بيانات الإعدادات مطلوبة" });
      }

      // Array to track any failed settings
      const failures = [];
      let successCount = 0;

      // Process each setting
      for (const [key, value] of Object.entries(settings)) {
        try {
          // Generate description based on key
          let description = "";
          switch (key) {
            case "siteName": description = "اسم الموقع/التطبيق"; break;
            case "siteTitle": description = "عنوان الموقع"; break;
            case "authPageTitle": description = "عنوان صفحة تسجيل الدخول"; break;
            case "authPageSubtitle": description = "وصف صفحة تسجيل الدخول"; break;
            case "siteLogo": description = "شعار الموقع"; break;
            case "authPageIcon": description = "أيقونة صفحة تسجيل الدخول"; break;
            case "primaryColor": description = "اللون الأساسي"; break;
            case "secondaryColor": description = "اللون الثانوي"; break;
            case "themeMode": description = "نمط المظهر"; break;
            case "fontFamily": description = "نوع الخط"; break;
            case "minPasswordLength": description = "الحد الأدنى لطول كلمة المرور"; break;
            case "requireUppercase": description = "تطلب أحرف كبيرة"; break;
            case "requireLowercase": description = "تطلب أحرف صغيرة"; break;
            case "requireNumbers": description = "تطلب أرقام"; break;
            case "requireSpecialChars": description = "تطلب رموز خاصة"; break;
            case "maxLoginAttempts": description = "الحد الأقصى لمحاولات تسجيل الدخول"; break;
            case "lockoutDuration": description = "مدة الحظر بالدقائق"; break;
            case "sessionTimeout": description = "مدة انتهاء الجلسة بالدقائق"; break;
            default: description = key;
          }

          await storage.setSetting(key, value as string, description);
          successCount++;
        } catch (settingError) {
          failures.push({ key, error: (settingError as Error).message });
        }
      }

      // Clear settings cache after bulk update
      storage.clearSettingsCache();
      
      if (failures.length === 0) {
        res.json({ message: `تم حفظ جميع الإعدادات بنجاح (${successCount} إعداد)` });
      } else {
        res.status(207).json({ 
          message: `تم حفظ ${successCount} إعداد بنجاح، فشل في حفظ ${failures.length} إعداد`,
          failures 
        });
      }
    } catch (error) {
      console.error("Bulk settings save error:", error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/settings/:key", authMiddleware, async (req, res) => {
    try {
      const value = await storage.getSetting(req.params.key);
      if (value === undefined) {
        return res.status(404).json({ message: "الإعداد غير موجود" });
      }
      res.json({ value });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Dedicated maintenance mode endpoints
  app.get("/api/settings/maintenance", async (req, res) => {
    try {
      const value = await storage.getSetting("maintenance");
      res.json({ enabled: value === "true" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/settings/maintenance", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root') return res.sendStatus(403);
    try {
      const { enabled } = req.body;
      await storage.setSetting("maintenance", enabled ? "true" : "false", "وضع الصيانة");
      res.json({ message: "تم تحديث وضع الصيانة" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // System version endpoint (ESM compatible)
  app.get("/api/version", async (req, res) => {
    try {
      const pkg = await import('../package.json', { assert: { type: 'json' } });
      res.json({ version: pkg.default.version });
    } catch (error) {
      res.status(500).json({ message: "فشل في تحميل الإصدار" });
    }
  });

  // Password change route
  app.post("/api/change-password", authMiddleware, async (req, res) => {
    
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "كلمة المرور الحالية والجديدة مطلوبة" });
      }
      
      // Verify current password
      const user = await storage.getUser(req.user!.id);
      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة" });
      }
      
      // Validate new password against policy
      const settings = await storage.getAllSettings();
      const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
      
      const minLength = parseInt(settingsMap.minPasswordLength || "8");
      const requireUppercase = settingsMap.requireUppercase === "true";
      const requireLowercase = settingsMap.requireLowercase === "true";
      const requireNumbers = settingsMap.requireNumbers === "true";
      const requireSpecialChars = settingsMap.requireSpecialChars === "true";
      
      const errors = [];
      
      if (newPassword.length < minLength) {
        errors.push(`كلمة المرور يجب أن تكون ${minLength} أحرف على الأقل`);
      }
      if (requireUppercase && !/[A-Z]/.test(newPassword)) {
        errors.push("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل");
      }
      if (requireLowercase && !/[a-z]/.test(newPassword)) {
        errors.push("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل");
      }
      if (requireNumbers && !/\d/.test(newPassword)) {
        errors.push("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل");
      }
      if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
        errors.push("كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل");
      }
      
      if (errors.length > 0) {
        return res.status(400).json({ message: errors.join("، ") });
      }
      
      // Update password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(req.user!.id, hashedPassword);
      
      res.json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في تغيير كلمة المرور" });
  }
  });

  // Admin: Download full database backup
  app.get("/api/admin/backup", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root') return res.sendStatus(403);
    
    // Note: Netlify Functions have built-in 10-minute timeout
    
    try {
      console.log('Starting database backup...');
      
      // Set response headers first
      res.setHeader("Content-Disposition", `attachment; filename=backup-${Date.now()}.json`);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      
      // Start JSON streaming
      res.write('{\n');
      
      let isFirst = true;
      const writeSection = (key: string, data: any) => {
        if (!isFirst) res.write(',\n');
        res.write(`  "${key}": ${JSON.stringify(data, null, 2)}`);
        isFirst = false;
      };
      
      // Stream each section separately to avoid loading everything in memory
      console.log('📊 Backing up users...');
      const users = await storage.getAllUsers();
      writeSection('users', users);
      console.log(`✅ Users: ${users.length} records`);
      
      console.log('📊 Backing up families...');
      // Filter by branch if the user is an admin (not root)
      // Root users can see all families (branchFilter will be undefined)
      // Admin users only see families from their branch (if assigned)
      const branchFilter = req.user!.role === 'root' ? undefined : (req.user!.branch || null);
      const families = await storage.getAllFamilies(branchFilter);
      writeSection('families', families);
      console.log(`✅ Families: ${families.length} records`);
      
      console.log('📊 Backing up members...');
      // Stream members in batches to avoid memory overload
      const allMembers = [];
      const BATCH_SIZE = 1000;
      let offset = 0;
      let memberBatch;
      
      do {
        // Get members in batches (would need to implement pagination in storage)
        // For now, get all at once but this could be optimized further
        memberBatch = await db.select().from(members).limit(BATCH_SIZE).offset(offset);
        allMembers.push(...memberBatch);
        offset += BATCH_SIZE;
        console.log(`📊 Loaded ${allMembers.length} members so far...`);
      } while (memberBatch.length === BATCH_SIZE);
      
      writeSection('members', allMembers);
      console.log(`✅ Members: ${allMembers.length} records`);
      
      console.log('📊 Backing up requests...');
      const requests = await storage.getAllRequests();
      writeSection('requests', requests);
      console.log(`✅ Requests: ${requests.length} records`);
      
      console.log('📊 Backing up notifications...');
      const notifications = await storage.getAllNotifications();
      writeSection('notifications', notifications);
      console.log(`✅ Notifications: ${notifications.length} records`);
      
      console.log('📊 Backing up settings...');
      const settings = await storage.getAllSettings();
      writeSection('settings', settings);
      console.log(`✅ Settings: ${settings.length} records`);
      
      console.log('📊 Backing up logs...');
      const logs = await storage.getLogs({ limit: 10000 }); // Limit logs to prevent huge backups
      writeSection('logs', logs);
      console.log(`✅ Logs: ${logs.length} records`);
      
      // End JSON and close stream
      res.write('\n}');
      res.end();
      
      console.log(`✅ Backup completed successfully: ${families.length} families, ${allMembers.length} members, ${requests.length} requests`);
      
    } catch (e) {
      console.error('Backup creation error:', e);
      if (!res.headersSent) {
        res.status(500).json({ message: "فشل في إنشاء النسخة الاحتياطية" });
      } else {
        res.end();
      }
    }
  });

  // Admin: Restore full database from backup
  app.post("/api/admin/restore", authMiddleware, upload.single("backup"), async (req, res) => {
    if (req.user!.role !== 'root') return res.sendStatus(403);
    try {
      if (!req.file) return res.status(400).json({ message: "يرجى رفع ملف النسخة الاحتياطية" });
      const data = JSON.parse(req.file.buffer.toString());
      // Clear all tables (order matters for FKs)
      await storage.clearLogs();
      await storage.clearNotifications();
      await storage.clearRequests();
      await storage.clearMembers();
      await storage.clearFamilies();
      await storage.clearUsers();
      await storage.clearSettings();
      // Insert new data
      for (const s of data.settings || []) await storage.setSetting(s.key, s.value, s.description);
      for (const u of data.users || []) await storage.createUser(u);
      for (const f of data.families || []) await storage.createFamily(f);
      for (const m of data.members || []) await storage.createMember(m);
      for (const r of data.requests || []) await storage.createRequest(r);
      for (const n of data.notifications || []) await storage.createNotification(n);
      for (const l of data.logs || []) await storage.createLog(l);
      res.json({ message: "تمت استعادة البيانات بنجاح" });
    } catch (e) {
      res.status(500).json({ message: "فشل في استعادة النسخة الاحتياطية" });
  }
  });

  // Admin: Automated Merge from another database
  app.post("/api/admin/merge", authMiddleware, async (req, res) => {
    if (req.user!.role !== 'root') return res.sendStatus(403);
    try {
      const { url } = req.body;
      const remoteUrl = url || process.env.DATABASE_URL;
      if (!remoteUrl) return res.status(400).json({ message: "يرجى إدخال رابط قاعدة البيانات أو ضبطه في البيئة" });
      // Connect to remote DB
      const { Pool } = pg;
      const remotePool = new Pool({ connectionString: remoteUrl, ssl: { rejectUnauthorized: false } });
      const remoteDb = { query: (...args: any[]) => remotePool.query(...args) };
      // Helper to fetch all rows from a table
      async function fetchAll(table: string) {
        const { rows } = await remoteDb.query(`SELECT * FROM ${table}`);
        return rows;
      }
      // Fetch remote data
      const remote = {
        users: await fetchAll('users'),
        families: await fetchAll('families'),
        members: await fetchAll('members'),
        requests: await fetchAll('requests'),
        notifications: await fetchAll('notifications'),
        settings: await fetchAll('settings'),
        logs: await fetchAll('logs'),
      };
      // OPTIMIZED: Merge logic using bulk operations instead of N+1 queries
      let inserted = 0, updated = 0, skipped = 0;
      
      console.log('📊 Starting optimized merge process...');
      
      // Get all local data in bulk upfront
      console.log('📊 Loading local data...');
      const [localUsers, localFamilies, localMembers, localRequests, localNotifications, localSettings, localLogs] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllFamilies(),
        db.select().from(members), // Direct query for efficiency
        storage.getAllRequests(),
        storage.getAllNotifications(),
        storage.getAllSettings(),
        storage.getLogs({})
      ]);
      
      // Create lookup maps for O(1) access
      const localUserMap = new Map(localUsers.map(u => [u.id, u]));
      const localFamilyMap = new Map(localFamilies.map(f => [f.id, f]));
      const localMemberMap = new Map(localMembers.map(m => [m.id, m]));
      const localRequestMap = new Map(localRequests.map(r => [r.id, r]));
      const localNotificationMap = new Map(localNotifications.map(n => [n.id, n]));
      const localSettingsMap = new Map(localSettings.map(s => [s.key, s]));
      const localLogMap = new Map(localLogs.map(l => [l.id, l]));
      
      console.log('📊 Processing users in batches...');
      // Process Users in batches
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
      
      // Batch insert/update users
      if (userOperations.toInsert.length > 0) {
        console.log(`📊 Inserting ${userOperations.toInsert.length} users...`);
        for (const user of userOperations.toInsert) {
          await storage.createUser(user);
          inserted++;
        }
      }
      if (userOperations.toUpdate.length > 0) {
        console.log(`📊 Updating ${userOperations.toUpdate.length} users...`);
        for (const user of userOperations.toUpdate) {
          await storage.updateUser(user.id, user);
          updated++;
        }
      }
      
      console.log('📊 Processing families in batches...');
      // Process Families in batches
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
      
      // Batch insert/update families
      if (familyOperations.toInsert.length > 0) {
        console.log(`📊 Inserting ${familyOperations.toInsert.length} families...`);
        for (const family of familyOperations.toInsert) {
          await storage.createFamily(family);
          inserted++;
        }
      }
      if (familyOperations.toUpdate.length > 0) {
        console.log(`📊 Updating ${familyOperations.toUpdate.length} families...`);
        for (const family of familyOperations.toUpdate) {
          await storage.updateFamily(family.id, family);
          updated++;
        }
      }
      
      console.log('📊 Processing members in batches...');
      // Process Members in batches
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
      
      // Batch insert/update members
      if (memberOperations.toInsert.length > 0) {
        console.log(`📊 Inserting ${memberOperations.toInsert.length} members...`);
        for (const member of memberOperations.toInsert) {
          await storage.createMember(member);
          inserted++;
        }
      }
      if (memberOperations.toUpdate.length > 0) {
        console.log(`📊 Updating ${memberOperations.toUpdate.length} members...`);
        for (const member of memberOperations.toUpdate) {
          await storage.updateMember(member.id, member);
          updated++;
        }
      }
      
      console.log('📊 Processing requests in batches...');
      // Process Requests in batches
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
      
      // Batch insert/update requests
      if (requestOperations.toInsert.length > 0) {
        console.log(`📊 Inserting ${requestOperations.toInsert.length} requests...`);
        for (const request of requestOperations.toInsert) {
          await storage.createRequest(request);
          inserted++;
        }
      }
      if (requestOperations.toUpdate.length > 0) {
        console.log(`📊 Updating ${requestOperations.toUpdate.length} requests...`);
        for (const request of requestOperations.toUpdate) {
          await storage.updateRequest(request.id, request);
          updated++;
        }
      }
      
      console.log('📊 Processing notifications...');
      // Process Notifications (insert only)
      for (const r of remote.notifications) {
        if (!localNotificationMap.has(r.id)) {
          await storage.createNotification(r);
          inserted++;
        } else {
          skipped++;
        }
      }
      
      console.log('📊 Processing settings...');
      // Process Settings (insert only for new keys)
      for (const r of remote.settings) {
        if (!localSettingsMap.has(r.key)) {
          await storage.setSetting(r.key, r.value, r.description);
          inserted++;
        } else {
          skipped++;
        }
      }
      
      console.log('📊 Processing logs...');
      // Process Logs (insert only)
      for (const r of remote.logs) {
        if (!localLogMap.has(r.id)) {
          await storage.createLog(r);
          inserted++;
        } else {
          skipped++;
        }
      }
      
      // Clear settings cache after merge
      storage.clearSettingsCache();
      await remotePool.end();
      res.json({ message: `تم الدمج: ${inserted} مضافة، ${updated} محدثة، ${skipped} متطابقة.` });
    } catch (e) {
      res.status(500).json({ message: "فشل في الدمج التلقائي: " + (e as Error).message });
  }
  });

  // Users routes
  app.get("/api/users", authMiddleware, async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) return res.sendStatus(403);
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Support Vouchers routes
  app.get("/api/support-vouchers", authMiddleware, async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) return res.sendStatus(403);
    
    // Note: Netlify Functions have built-in timeout handling
    
    try {
      const vouchers = await storage.getAllSupportVouchersOptimized();
      res.json(vouchers);
    } catch (error) {
      console.error('Support vouchers endpoint error:', error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/support-vouchers/:id", authMiddleware, async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) return res.sendStatus(403);
    try {
      const voucherId = parseInt(req.params.id);
      const voucher = await storage.getSupportVoucher(voucherId);
      
      if (!voucher) {
        return res.status(404).json({ message: "الكوبون غير موجود" });
      }
      
      // Get creator and recipients
      const creator = await storage.getUser(voucher.createdBy);
      const recipients = await storage.getVoucherRecipientsOptimized(voucherId);
      
      const voucherWithDetails = {
        ...voucher,
        creator: creator!,
        recipients
      };
      
      res.json(voucherWithDetails);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/support-vouchers", authMiddleware, async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) return res.sendStatus(403);
    try {
      console.log('Received voucher data:', req.body);
      
      // Create a schema that doesn't require createdBy (it will be set manually)
      const createVoucherSchema = insertSupportVoucherSchema.omit({ createdBy: true });
      const voucherData = createVoucherSchema.parse(req.body);
      
      console.log('Parsed voucher data:', voucherData);
      
      // Add the createdBy field manually
      const voucherToCreate = {
        ...voucherData,
        createdBy: req.user!.id
      };
      
      const voucher = await storage.createSupportVoucher(voucherToCreate);
      res.status(201).json(voucher);
    } catch (error) {
      console.error('Error creating voucher:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.patch("/api/support-vouchers/:id", authMiddleware, async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) return res.sendStatus(403);
    try {
      const voucherId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const voucher = await storage.getSupportVoucher(voucherId);
      if (!voucher) {
        return res.status(404).json({ message: "الكوبون غير موجود" });
      }
      
      const updatedVoucher = await storage.updateSupportVoucher(voucherId, { isActive });
      res.json(updatedVoucher);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/support-vouchers/:id/recipients", authMiddleware, async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) return res.sendStatus(403);
    try {
      const voucherId = parseInt(req.params.id);
      const { familyIds } = req.body;
      
      if (!Array.isArray(familyIds)) {
        return res.status(400).json({ message: "يجب أن تكون معرفات العوائل مصفوفة" });
      }

      const recipients = [];
      for (const familyId of familyIds) {
        const recipientData = {
          voucherId,
          familyId,
          status: 'pending' as const
        };
        const recipient = await storage.createVoucherRecipient(recipientData);
        recipients.push(recipient);
      }
      
      res.status(201).json(recipients);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/support-vouchers/:id/notify", authMiddleware, async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) return res.sendStatus(403);
    try {
      const voucherId = parseInt(req.params.id);
      const { recipientIds } = req.body;
      
      const voucher = await storage.getSupportVoucher(voucherId);
      if (!voucher) {
        return res.status(404).json({ message: "الكوبون غير موجود" });
      }

      const recipients = await storage.getVoucherRecipients(voucherId);
      const targetRecipients = recipientIds 
        ? recipients.filter(r => recipientIds.includes(r.id))
        : recipients;

      // Create notification for each recipient
      for (const recipient of targetRecipients) {
        let message = `تم إضافة كوبونة دعم الى عائلتك "${voucher.title}". يرجى الذهاب الى مكان الاستلام لاستلام الكوبونة.`;
        
        if (voucher.location) {
          message += `\n\nموقع الاستلام: ${voucher.location}`;
        }
        
        const notification = {
          title: `كوبونة دعم جديد: ${voucher.title}`,
          message: message,
          target: 'specific' as const,
          recipients: [recipient.familyId]
        };
        await storage.createNotification(notification);
        
        // Update recipient notification status
        await storage.updateVoucherRecipient(recipient.id, {
          notified: true,
          notifiedAt: new Date(),
          updatedBy: req.user!.id
        });
      }
      
      res.json({ message: `تم إرسال ${targetRecipients.length} إشعار` });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Voucher Recipients routes
  app.patch("/api/voucher-recipients/:id", authMiddleware, async (req, res) => {
    if (!['admin', 'root'].includes(req.user!.role)) return res.sendStatus(403);
    try {
      const recipientId = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      const updateData: any = { updatedBy: req.user!.id };
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      
      const recipient = await storage.updateVoucherRecipient(recipientId, updateData);
      if (!recipient) return res.status(404).json({ message: "المستلم غير موجود" });
      
      res.json(recipient);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
  }
  });

  const httpServer = createServer(app);

  // Set longer timeout for import operations (10 minutes to handle large datasets)
  httpServer.setTimeout(600000); // 10 minutes (600,000 ms)
  httpServer.keepAliveTimeout = 601000; // 10 minutes + 1 second
  httpServer.headersTimeout = 602000; // 10 minutes + 2 seconds

  return httpServer;
}