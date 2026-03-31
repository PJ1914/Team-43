import { Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth";
import { reportsCollection, sectionsCollection } from "../services/firestoreService";
import { getSectionsConfig } from "../services/configService";
import { recomputeReportStatus } from "../services/reportMetricsService";

const createWeekSchema = z.object({
  department: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export const createWeekReport = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = createWeekSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  // Faculty can only create reports for their own department
  if (req.user?.role === "faculty" && parsed.data.department !== req.user?.department) {
    return res.status(403).json({ message: "You can only create reports for your own department" });
  }

  const reportRef = reportsCollection.doc();
  const reportId = reportRef.id;
  const createdBy = req.user?.uid ?? "unknown";

  await reportRef.set({
    reportId,
    department: parsed.data.department,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    status: "pending",
    createdBy,
    createdAt: new Date().toISOString(),
  });

  const sections = await getSectionsConfig();
  await Promise.all(
    sections.map((section) =>
      sectionsCollection.doc(`${reportId}_${section.id}`).set({
        sectionId: section.id,
        reportId,
        name: section.name,
        completed: false,
      }),
    ),
  );

  return res.status(201).json({ reportId });
};

export const getReportById = async (req: AuthenticatedRequest, res: Response) => {
  const weekId = String(req.params.weekId ?? "");

  const reportDoc = await reportsCollection.doc(weekId).get();
  if (!reportDoc.exists) {
    return res.status(404).json({ message: "Report not found" });
  }

  const sectionsSnapshot = await sectionsCollection.where("reportId", "==", weekId).get();
  const sectionsConfig = await getSectionsConfig();
  const order = new Map(sectionsConfig.map((section, index) => [section.id, index]));
  const sections = sectionsSnapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => (order.get(a.sectionId) ?? 999) - (order.get(b.sectionId) ?? 999));

  return res.status(200).json({ report: reportDoc.data(), sections });
};

export const getReports = async (req: AuthenticatedRequest, res: Response) => {
  // Faculty can only see reports from their own department
  let reportsQuery;
  
  if (req.user?.role === "faculty") {
    // For faculty, filter by department (no orderBy to avoid composite index requirement)
    reportsQuery = reportsCollection.where("department", "==", req.user.department);
  } else {
    // For admin/coordinator, get all reports
    reportsQuery = reportsCollection;
  }
  
  const reportsSnapshot = await reportsQuery.get();

  const reports = await Promise.all(
    reportsSnapshot.docs.map(async (doc) => {
      const report = doc.data();
      const metrics = await recomputeReportStatus(report.reportId);
      return {
        ...report,
        status: metrics.status,
        totalSections: metrics.total,
        completedSections: metrics.completed,
        inProgressSections: metrics.inProgress,
        pendingSections: metrics.pending,
      };
    }),
  );

  // Sort by createdAt in memory (descending)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (reports as any[]).sort((a, b) => new Date(String(b.createdAt ?? "")).getTime() - new Date(String(a.createdAt ?? "")).getTime());

  return res.status(200).json({ reports });
};
