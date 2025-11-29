import { Request, Response } from 'express';
import { db } from '../db';
import { heads } from '../schema';
import * as XLSX from 'xlsx';
import { and, eq } from 'drizzle-orm';

// Define the expected structure for head data
interface HeadData {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  relation?: string;
  familyId?: string;
  [key: string]: any;
}

export const importHeadsChunk = async (req: Request, res: Response) => {
  try {
    const { chunk, total, current, sessionId } = req.body;

    if (!chunk || !Array.isArray(chunk)) {
      return res.status(400).json({ error: 'Invalid chunk data' });
    }

    // Validate that the chunk contains valid head data
    const validChunk = chunk.map((item: any) => {
      // Ensure required fields exist and sanitize data
      return {
        id: item.id || undefined,
        firstName: String(item.firstName || ''),
        lastName: String(item.lastName || ''),
        email: item.email || null,
        phone: item.phone || null,
        birthDate: item.birthDate || null,
        gender: item.gender || null,
        relation: item.relation || null,
        familyId: item.familyId || null,
      } as HeadData;
    });

    // Perform bulk insert with conflict resolution
    const result = await db.insert(heads)
      .values(validChunk)
      .onConflictDoUpdate({ 
        target: heads.id, 
        set: {
          firstName: heads.firstName,
          lastName: heads.lastName,
          email: heads.email,
          phone: heads.phone,
          birthDate: heads.birthDate,
          gender: heads.gender,
          relation: heads.relation,
          familyId: heads.familyId,
          updatedAt: new Date(),
        }
      })
      .execute();

    // Return progress information
    const processed = Math.min(current, total);
    const progress = Math.round((processed / total) * 100);

    res.json({
      success: true,
      processed: processed,
      total: total,
      progress: progress,
      sessionId: sessionId,
      message: `Processed batch: ${processed}/${total} heads imported`
    });

  } catch (error) {
    console.error('Error importing chunk:', error);
    res.status(500).json({ 
      error: 'Failed to import chunk', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Endpoint to initialize import session and get total records
export const initializeImportSession = async (req: Request, res: Response) => {
  try {
    const { fileBuffer } = req.body;

    // Process the file to get the total count without importing yet
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Generate a session ID for this import
    const sessionId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      sessionId,
      totalRecords: data.length,
      message: `Import session initialized for ${data.length} records`
    });

  } catch (error) {
    console.error('Error initializing import session:', error);
    res.status(500).json({ 
      error: 'Failed to initialize import session', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Endpoint to finalize import session
export const finalizeImportSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    // Here you can perform any finalization logic
    // For example, update statistics, send notifications, etc.
    
    res.json({
      success: true,
      message: 'Import session completed successfully',
      sessionId
    });

  } catch (error) {
    console.error('Error finalizing import session:', error);
    res.status(500).json({ 
      error: 'Failed to finalize import session', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};