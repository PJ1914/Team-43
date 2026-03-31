import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";
import { DocumentUpload } from "../types";

export const uploadEntryDocument = async (
  reportId: string,
  entryId: string,
  file: File
): Promise<DocumentUpload> => {
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${timestamp}_${safeFileName}`;
  const storageRef = ref(storage, `entry-documents/${reportId}/${entryId}/${fileName}`);

  await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(storageRef);

  return {
    fileName: file.name,
    fileUrl,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
  };
};

export const deleteEntryDocument = async (fileUrl: string): Promise<void> => {
  try {
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};
