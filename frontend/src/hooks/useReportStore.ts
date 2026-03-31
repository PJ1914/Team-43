import { create } from "zustand";
import api from "../services/api";
import { ReportOverview, Section } from "../types";

interface ReportState {
  reports: ReportOverview[];
  selectedReportSections: Section[];
  loadingReports: boolean;
  loadReports: () => Promise<void>;
  loadSectionsForReport: (reportId: string) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  selectedReportSections: [],
  loadingReports: false,
  loadReports: async () => {
    set({ loadingReports: true });
    try {
      const { data } = await api.get<{ reports: ReportOverview[] }>("/reports");
      set({ reports: data.reports, loadingReports: false });
    } catch {
      set({ reports: [], loadingReports: false });
    }
  },
  loadSectionsForReport: async (reportId: string) => {
    const { data } = await api.get<{ sections: Section[] }>(`/reports/${reportId}`);
    set({ selectedReportSections: data.sections });
  },
}));
