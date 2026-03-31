import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import EntryForm from "./EntryForm";
import EntryList from "./EntryList";
import Spinner from "../../components/ui/Spinner";
import { subscribeToEntries } from "../../hooks/useRealtimeEntries";
import { Entry, EntryData, DocumentUpload } from "../../types";
import api from "../../services/api";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useEffect } from "react";
import { uploadEntryDocument } from "../../services/storageService";

const SectionPage = () => {
  const { weekId = "", sectionId = "" } = useParams();
  const { sections, isLoaded } = useConfigStore((state) => ({ sections: state.sections, isLoaded: state.isLoaded }));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);

  useEffect(() => {
    if (!weekId || !sectionId || !isLoaded) {
      return;
    }

    const unsubscribe = subscribeToEntries(
      weekId, 
      sectionId, 
      (nextEntries) => {
        setEntries(nextEntries);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to entries:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [weekId, sectionId, isLoaded]);

  const sectionName = useMemo(
    () => sections.find((section) => section.id === sectionId)?.name ?? sectionId,
    [sections, sectionId],
  );

  const handleCreate = async (data: EntryData, documents: DocumentUpload[]) => {
    // Upload files to Firebase Storage first
    const uploadedDocuments: DocumentUpload[] = [];
    
    for (const doc of documents) {
      // Check if this document has a file object (new upload)
      const file = (doc as any).file;
      if (file) {
        // Create temporary entry ID for upload path
        const tempEntryId = `temp_${Date.now()}`;
        const uploaded = await uploadEntryDocument(weekId, tempEntryId, file);
        uploadedDocuments.push(uploaded);
      } else {
        // Already uploaded document
        uploadedDocuments.push(doc);
      }
    }
    
    await api.post(`/sections/${sectionId}/add-entry`, { 
      weekId, 
      data,
      documents: uploadedDocuments,
    });
  };

  const handleUpdate = async (data: EntryData, documents: DocumentUpload[]) => {
    if (!editing) {
      return;
    }
    
    // Upload any new files
    const uploadedDocuments: DocumentUpload[] = [];
    
    for (const doc of documents) {
      const file = (doc as any).file;
      if (file) {
        const uploaded = await uploadEntryDocument(weekId, editing.entryId, file);
        uploadedDocuments.push(uploaded);
      } else {
        uploadedDocuments.push(doc);
      }
    }
    
    await api.put(`/sections/${sectionId}/update-entry/${editing.entryId}`, { 
      weekId, 
      data,
      documents: uploadedDocuments,
    });
  };

  const handleDelete = async (entryId: string) => {
    await api.delete(`/sections/${sectionId}/delete-entry/${entryId}`, { data: { weekId } });
  };

  const handleVerify = async (entryId: string, action: "approve" | "reject", comments?: string) => {
    await api.put(`/sections/${sectionId}/verify-entry/${entryId}`, {
      action,
      comments,
    });
  };

  if (!isLoaded || loading) {
    return <Spinner label="Loading section entries..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-panel">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{sectionName}</h1>
          <p className="text-sm text-slate-500">Collaborative entries for this section.</p>
        </div>
        <button
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
        >
          Add Entry
        </button>
      </div>

      <EntryList
        entries={entries}
        onEdit={(entry) => {
          setEditing(entry);
          setShowModal(true);
        }}
        onDelete={handleDelete}
        onVerify={handleVerify}
      />

      <Modal
        open={showModal}
        title={editing ? "Edit Entry" : "Add Entry"}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
      >
        <EntryForm
          initialData={editing?.data}
          initialEntry={editing ?? undefined}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowModal(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default SectionPage;
