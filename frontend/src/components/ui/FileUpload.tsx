import { ChangeEvent, useState } from "react";
import { DocumentUpload } from "../../types";
import { formatFileSize } from "../../services/storageService";

interface FileUploadProps {
  documents: DocumentUpload[];
  onDocumentsChange: (documents: DocumentUpload[]) => void;
  disabled?: boolean;
}

const FileUpload = ({ documents, onDocumentsChange, disabled }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newDocuments: DocumentUpload[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Create a temporary document object (will be uploaded when entry is saved)
      const tempDoc: DocumentUpload = {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file), // Temporary local URL
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      };
      
      // Store the file object for later upload (we'll handle this in the parent)
      (tempDoc as any).file = file;
      
      newDocuments.push(tempDoc);
    }

    onDocumentsChange([...documents, ...newDocuments]);
    setUploading(false);
    event.target.value = ""; // Reset input
  };

  const handleRemoveDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    onDocumentsChange(newDocuments);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />
          {uploading ? "Preparing files..." : "📎 Attach Documents"}
        </label>
        <span className="text-xs text-slate-500">
          PDF, DOC, DOCX, Images (Max 10MB each)
        </span>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{doc.fileName}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(doc.fileSize)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDocument(index)}
                disabled={disabled}
                className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                title="Remove document"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
