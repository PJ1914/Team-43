import { Entry } from "../../types";
import EmptyState from "../../components/ui/EmptyState";
import VerificationBadge from "../../components/ui/VerificationBadge";
import { useAuthStore } from "../../hooks/useAuthStore";

interface EntryListProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (entryId: string) => Promise<void>;
  onVerify?: (entryId: string, action: "approve" | "reject", comments?: string) => Promise<void>;
}

const EntryList = ({ entries, onEdit, onDelete, onVerify }: EntryListProps) => {
  const { profile } = useAuthStore();
  const canVerify = profile?.role === "coordinator" || profile?.role === "admin";

  const handleVerify = async (entryId: string, action: "approve" | "reject") => {
    if (!onVerify) return;
    
    if (action === "reject") {
      const comments = prompt("Enter rejection reason (optional):");
      await onVerify(entryId, action, comments || undefined);
    } else {
      await onVerify(entryId, action);
    }
  };

  if (!entries.length) {
    return <EmptyState />;
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {entries.map((entry) => (
          <div key={entry.entryId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700 truncate">{entry.contributorName ?? entry.createdBy}</p>
                <p className="text-xs text-slate-500 mt-0.5">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
              <VerificationBadge status={entry.verificationStatus} />
            </div>
            
            {/* Data */}
            <div className="mb-3 space-y-1.5">
              {Object.entries(entry.data).map(([key, value]) => (
                <p key={key} className="text-sm">
                  <span className="font-semibold text-slate-600">{key}:</span>{" "}
                  <span className="text-slate-700">{String(value)}</span>
                </p>
              ))}
            </div>

            {/* Documents */}
            {entry.documents && entry.documents.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">Documents:</p>
                <div className="space-y-1">
                  {entry.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {doc.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Info */}
            {entry.verificationStatus === "rejected" && entry.verificationComments && (
              <div className="mb-3 p-2 bg-rose-50 rounded-lg">
                <p className="text-xs text-rose-700">{entry.verificationComments}</p>
              </div>
            )}
            {entry.verifiedByName && (
              <p className="text-xs text-slate-500 mb-3">Verified by: {entry.verifiedByName}</p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button 
                className="flex-1 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition" 
                onClick={() => onEdit(entry)}
              >
                Edit
              </button>
              <button 
                className="flex-1 rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition" 
                onClick={() => void onDelete(entry.entryId)}
              >
                Delete
              </button>
              {canVerify && entry.verificationStatus === "pending" && (
                <>
                  <button 
                    className="flex-1 rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-200 transition flex items-center justify-center gap-1.5"
                    onClick={() => void handleVerify(entry.entryId, "approve")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                  <button 
                    className="flex-1 rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition flex items-center justify-center gap-1.5"
                    onClick={() => void handleVerify(entry.entryId, "reject")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contributor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr key={entry.entryId}>
                  <td className="px-4 py-3 text-sm text-slate-700">{entry.contributorName ?? entry.createdBy}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="space-y-1">
                      {Object.entries(entry.data).map(([key, value]) => (
                        <p key={key}><span className="font-semibold">{key}:</span> {String(value)}</p>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {entry.documents && entry.documents.length > 0 ? (
                      <div className="space-y-1">
                        {entry.documents.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 hover:underline"
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {doc.fileName}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No documents</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <VerificationBadge status={entry.verificationStatus} />
                      {entry.verificationStatus === "rejected" && entry.verificationComments && (
                        <p className="text-xs text-rose-600">{entry.verificationComments}</p>
                      )}
                      {entry.verifiedByName && (
                        <p className="text-xs text-slate-500">By: {entry.verifiedByName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{new Date(entry.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200" onClick={() => onEdit(entry)}>Edit</button>
                        <button className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-200" onClick={() => void onDelete(entry.entryId)}>Delete</button>
                      </div>
                      {canVerify && entry.verificationStatus === "pending" && (
                        <div className="flex gap-2">
                          <button 
                            className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200"
                            onClick={() => void handleVerify(entry.entryId, "approve")}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button 
                            className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                            onClick={() => void handleVerify(entry.entryId, "reject")}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default EntryList;
