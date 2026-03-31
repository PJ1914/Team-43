import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { Entry } from "../types";

export const subscribeToEntries = (
  reportId: string,
  sectionId: string,
  onData: (entries: Entry[]) => void,
  onError?: (error: Error) => void,
) => {
  const entriesRef = collection(db, "entries");
  const q = query(
    entriesRef,
    where("reportId", "==", reportId),
    where("sectionId", "==", sectionId),
  );

  let isActive = true;

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (!isActive) return;
      
      const entries = snapshot.docs.map((doc) => ({
        entryId: doc.id,
        ...(doc.data() as Omit<Entry, "entryId">),
      }));
      
      // Sort client-side by createdAt descending
      entries.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      onData(entries);
    },
    (error) => {
      console.error("Firestore snapshot error:", error);
      if (onError) {
        onError(error);
      }
    },
  );

  return () => {
    isActive = false;
    unsubscribe();
  };
};
