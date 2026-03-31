import { Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth";
import { entriesCollection, usersCollection } from "../services/firestoreService";
import { recomputeReportStatus, updateSectionCompletion } from "../services/reportMetricsService";
import { getSectionSchema } from "../services/configService";

const addEntrySchema = z.object({
  weekId: z.string().min(1),
  data: z.record(z.union([z.string(), z.number(), z.boolean()])),
  documents: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string(),
    fileSize: z.number(),
    uploadedAt: z.string(),
  })).optional(),
});

const updateEntrySchema = z.object({
  weekId: z.string().min(1),
  data: z.record(z.union([z.string(), z.number(), z.boolean()])),
  documents: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string(),
    fileSize: z.number(),
    uploadedAt: z.string(),
  })).optional(),
});

const deleteEntrySchema = z.object({ weekId: z.string().min(1) });

const validateEntryData = async (sectionId: string, data: Record<string, string | number | boolean>): Promise<boolean> => {
  const schema = await getSectionSchema(sectionId);
  if (!schema) {
    return false;
  }

  // Check required fields
  for (const field of schema.fields) {
    if (field.required) {
      const value = data[field.name];
      if (value === undefined || value === null || value === "") {
        return false;
      }
    }
  }

  return true;
};

export const addEntry = async (req: AuthenticatedRequest, res: Response) => {
  const sectionId = String(req.params.sectionId ?? "");
  const parsed = addEntrySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const isValid = await validateEntryData(sectionId, parsed.data.data);
  if (!isValid) {
    return res.status(400).json({ message: "Entry data does not match section schema or missing required fields" });
  }

  const entryRef = entriesCollection.doc();
  await entryRef.set({
    entryId: entryRef.id,
    documents: parsed.data.documents ?? [],
    verificationStatus: "pending",
    sectionId,
    reportId: parsed.data.weekId,
    data: parsed.data.data,
    createdBy: req.user?.uid,
    createdAt: new Date().toISOString(),
    contributorName: req.user?.name,
  });

  await updateSectionCompletion(parsed.data.weekId, sectionId);
  await recomputeReportStatus(parsed.data.weekId);

  return res.status(201).json({ entryId: entryRef.id });
};

export const updateEntry = async (req: AuthenticatedRequest, res: Response) => {
  const sectionId = String(req.params.sectionId ?? "");
  const entryId = String(req.params.entryId ?? "");
  const parsed = updateEntrySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const isValid = await validateEntryData(sectionId, parsed.data.data);
  if (!isValid) {
    return res.status(400).json({ message: "Entry data does not match section schema or missing required fields" });
  }

  await entriesCollection.doc(entryId).set(
    {
      data: parsed.data.data,
      documents: parsed.data.documents,
      updatedAt: new Date().toISOString(),
      sectionId,
      reportId: parsed.data.weekId,
      verificationStatus: "pending", // Reset to pending when edited
    },
    { merge: true },
  );

  await updateSectionCompletion(parsed.data.weekId, sectionId);
  await recomputeReportStatus(parsed.data.weekId);

  return res.status(200).json({ message: "Entry updated" });
};

export const deleteEntry = async (req: AuthenticatedRequest, res: Response) => {
  const sectionId = String(req.params.sectionId ?? "");
  const entryId = String(req.params.entryId ?? "");
  const parsed = deleteEntrySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  await entriesCollection.doc(entryId).delete();
  await updateSectionCompletion(parsed.data.weekId, sectionId);
  await recomputeReportStatus(parsed.data.weekId);

  return res.status(200).json({ message: "Entry deleted" });
};

export const getSectionEntries = async (req: AuthenticatedRequest, res: Response) => {
  const sectionId = String(req.params.sectionId ?? "");
  const weekId = String(req.params.weekId ?? "");

  const snapshot = await entriesCollection
    .where("sectionId", "==", sectionId)
    .where("reportId", "==", weekId)
    .get();

  const entries = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const userDoc = data.createdBy ? await usersCollection.doc(data.createdBy).get() : null;
      const contributorName = userDoc?.exists ? String(userDoc.data()?.name ?? data.createdBy) : data.createdBy;
      
      // Get verifier name if entry is verified
      let verifiedByName;
      if (data.verifiedBy) {
        const verifierDoc = await usersCollection.doc(data.verifiedBy).get();
        verifiedByName = verifierDoc?.exists ? String(verifierDoc.data()?.name ?? data.verifiedBy) : data.verifiedBy;
      }
      
      return {
        ...data,
        entryId: doc.id,
        contributorName,
        verifiedByName,
      };
    }),
  );

  return res.status(200).json({ entries });
};

const verifyEntrySchema = z.object({
  action: z.enum(["approve", "reject"]),
  comments: z.string().optional(),
});

export const verifyEntry = async (req: AuthenticatedRequest, res: Response) => {
  const sectionId = String(req.params.sectionId ?? "");
  const entryId = String(req.params.entryId ?? "");
  const parsed = verifyEntrySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const entryDoc = await entriesCollection.doc(entryId).get();
  if (!entryDoc.exists) {
    return res.status(404).json({ message: "Entry not found" });
  }

  const verificationStatus = parsed.data.action === "approve" ? "approved" : "rejected";

  await entriesCollection.doc(entryId).set(
    {
      verificationStatus,
      verifiedBy: req.user?.uid,
      verifiedAt: new Date().toISOString(),
      verificationComments: parsed.data.comments,
    },
    { merge: true },
  );

  await updateSectionCompletion(entryDoc.data()?.reportId, sectionId);
  await recomputeReportStatus(entryDoc.data()?.reportId);

  return res.status(200).json({ 
    message: `Entry ${verificationStatus}`,
    verificationStatus,
  });
};
