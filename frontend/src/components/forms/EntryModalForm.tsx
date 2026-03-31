import { FormEvent, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { EntryData, DocumentUpload, Entry } from "../../types";
import { useConfigStore } from "../../hooks/useConfigStore";
import FileUpload from "../ui/FileUpload";

interface SectionField {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "textarea" | "select";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface EntryModalFormProps {
  initialData?: EntryData;
  initialEntry?: Entry;
  onSubmit: (data: EntryData, documents: DocumentUpload[]) => Promise<void>;
  onCancel: () => void;
}

const EntryModalForm = ({ initialData, initialEntry, onSubmit, onCancel }: EntryModalFormProps) => {
  const { sectionId = "" } = useParams();
  const getSchemaById = useConfigStore((state) => state.getSchemaById);
  
  const sectionSchema = useMemo(
    () => getSchemaById(sectionId),
    [sectionId, getSchemaById]
  );

  const initialFormData = useMemo(() => {
    if (!sectionSchema) return {};
    const data: EntryData = {};
    sectionSchema.fields.forEach((field) => {
      data[field.name] = initialData?.[field.name] ?? "";
    });
    return data;
  }, [sectionSchema, initialData]);

  const [formData, setFormData] = useState<EntryData>(initialFormData);
  const [documents, setDocuments] = useState<DocumentUpload[]>(initialEntry?.documents ?? []);
  const [saving, setSaving] = useState(false);

  const updateField = (fieldName: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(formData, documents);
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: SectionField) => {
    const value = formData[field.name] ?? "";
    const baseClasses = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

    if (field.type === "textarea") {
      return (
        <textarea
          className={baseClasses}
          placeholder={field.placeholder}
          value={String(value)}
          onChange={(e) => updateField(field.name, e.target.value)}
          required={field.required}
          rows={3}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          className={baseClasses}
          value={String(value)}
          onChange={(e) => updateField(field.name, e.target.value)}
          required={field.required}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "number") {
      return (
        <input
          type="number"
          className={baseClasses}
          placeholder={field.placeholder}
          value={typeof value === "number" ? value : ""}
          onChange={(e) => updateField(field.name, e.target.value ? Number(e.target.value) : "")}
          required={field.required}
        />
      );
    }

    return (
      <input
        type={field.type}
        className={baseClasses}
        placeholder={field.placeholder}
        value={String(value)}
        onChange={(e) => updateField(field.name, e.target.value)}
        required={field.required}
      />
    );
  };

  if (!sectionSchema) {
    return (
      <div className="text-center text-slate-500">
        Section schema not found. Please contact support.
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {sectionSchema.fields.map((field) => (
        <div key={field.name}>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {field.label}
            {field.required && <span className="ml-1 text-rose-500">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Supporting Documents
        </label>
        <FileUpload
          documents={documents}
          onDocumentsChange={setDocuments}
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-end space-x-2 pt-4">
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-brand-300"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </form>
  );
};

export default EntryModalForm;
