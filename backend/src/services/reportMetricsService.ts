import { entriesCollection, reportsCollection, sectionsCollection } from "./firestoreService";

export const updateSectionCompletion = async (reportId: string, sectionId: string) => {
  const entries = await entriesCollection
    .where("reportId", "==", reportId)
    .where("sectionId", "==", sectionId)
    .limit(1)
    .get();

  await sectionsCollection.doc(`${reportId}_${sectionId}`).set(
    {
      completed: !entries.empty,
    },
    { merge: true },
  );
};

export const recomputeReportStatus = async (reportId: string) => {
  const sectionSnapshot = await sectionsCollection.where("reportId", "==", reportId).get();
  const total = sectionSnapshot.docs.length;
  const completed = sectionSnapshot.docs.filter((doc) => Boolean(doc.data().completed)).length;

  let status: "pending" | "in_progress" | "completed" = "pending";
  if (completed > 0 && completed < total) {
    status = "in_progress";
  }
  if (completed === total && total > 0) {
    status = "completed";
  }

  await reportsCollection.doc(reportId).set({ status }, { merge: true });

  return {
    total,
    completed,
    inProgress: total - completed,
    pending: total - completed,
    status,
  };
};
