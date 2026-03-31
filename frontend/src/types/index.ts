export type Role = "faculty" | "coordinator" | "admin";

export type EntryData = Record<string, string | number | boolean>;

export interface UserProfile {
  uid: string;
  name: string;
  role: Role;
  department: string;
  email?: string;
}

export interface Report {
  reportId: string;
  department: string;
  startDate: string;
  endDate: string;
  status: "pending" | "in_progress" | "completed";
  createdBy: string;
  createdAt?: string;
}

export interface Section {
  sectionId: string;
  reportId: string;
  name: string;
  completed: boolean;
  entryCount?: number;
}

export interface DocumentUpload {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface Entry {
  entryId: string;
  sectionId: string;
  reportId: string;
  data: EntryData;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  contributorName?: string;
  documents?: DocumentUpload[];
  verificationStatus?: VerificationStatus;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  verificationComments?: string;
}

export interface ReportOverview extends Report {
  totalSections: number;
  completedSections: number;
  inProgressSections: number;
  pendingSections: number;
}
