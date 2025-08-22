import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";
import { storage } from '../../server/storage';
import { groqService } from '../../server/services/groq';

const generateSummarySchema = z.object({
  patientId: z.string(),
  summaryType: z.enum(["discharge", "progress", "handoff"]),
  additionalContext: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { patientId, summaryType, additionalContext } = generateSummarySchema.parse(req.body);

    // Get patient data
    const patient = await storage.getPatient(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Prepare patient data for AI
    const patientData = {
      name: patient.name,
      mrn: patient.mrn,
      age: patient.dateOfBirth ? Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined,
      gender: patient.gender || undefined,
      chiefComplaint: "Chest pain", // This would come from current encounter
    };

    // Generate AI summary
    const aiResponse = await groqService.generateClinicalSummary({
      patientData,
      summaryType,
      additionalContext,
    });

    // Save to storage
    const summary = await storage.createClinicalSummary({
      patientId,
      userId: "system", // In production, get from session
      type: summaryType,
      content: aiResponse.content,
      aiGenerated: true,
      groqModel: aiResponse.model,
      generationTime: aiResponse.generationTimeMs,
      status: "draft",
    });

    // Create audit log
    await storage.createAuditLog({
      userId: "system",
      action: "ai_summary_generated",
      resource: "clinical_summary",
      resourceId: summary.id,
      details: {
        summaryType,
        patientId,
        generationTimeMs: aiResponse.generationTimeMs,
        model: aiResponse.model,
      },
    });

    res.json({
      id: summary.id,
      content: aiResponse.content,
      generationTime: aiResponse.generationTimeMs,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
    });
  } catch (error) {
    console.error("AI summary generation failed:", error);
    res.status(500).json({ 
      message: "Failed to generate AI summary",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}