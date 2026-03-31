import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/ui/Spinner";
import { useConfigStore } from "../../hooks/useConfigStore";
import { Entry } from "../../types";

type FilterOption = "all" | "with-data" | "without-data";

const FILTER_LABELS: Record<FilterOption, string> = {
  all: "Export All 17 Sections",
  "with-data": "Export Sections With Data",
  "without-data": "Export Sections Without Data",
};

const ReportPreview = () => {
  const { weekId = "" } = useParams();
  const { sections, isLoaded } = useConfigStore((state) => ({ sections: state.sections, isLoaded: state.isLoaded }));
  const [entriesMap, setEntriesMap] = useState<Record<string, Entry[]>>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const responses = await Promise.all(
          sections.map((section) => api.get<{ entries: Entry[] }>(`/sections/${section.id}/${weekId}`)),
        );
        const nextMap: Record<string, Entry[]> = {};
        responses.forEach((response, index) => {
          nextMap[sections[index].id] = response.data.entries;
        });
        setEntriesMap(nextMap);
      } finally {
        setLoading(false);
      }
    };
    if (sections.length > 0) {
      void load();
    }
  }, [weekId, sections]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = async (filter: FilterOption) => {
    setDropdownOpen(false);
    setExporting(true);
    try {
      const response = await api.get(`/reports/${weekId}/export`, {
        params: { filter },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data as BlobPart], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Weekly-Report-${filter === "all" ? "" : filter === "with-data" ? "WithData-" : "Empty-"}${weekId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (!isLoaded || loading) {
    return <Spinner label="Building live report preview..." />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-panel">
        <h1 className="text-2xl font-bold text-slate-800">Live Report Preview</h1>

        {/* Export dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            disabled={exporting}
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {exporting ? "Exporting…" : "Export PDF"}
            <svg className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg">
              {(Object.keys(FILTER_LABELS) as FilterOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => void handleExport(option)}
                  className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl"
                >
                  {FILTER_LABELS[option]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {sections.map((section, index) => (
        <div key={section.id} className="rounded-2xl bg-white p-5 shadow-panel">
          <h2 className="text-lg font-bold text-slate-800">{index + 1}. {section.name}</h2>
          {entriesMap[section.id]?.length ? (
            <div className="mt-3 space-y-3">
              {entriesMap[section.id].map((entry) => (
                <div key={entry.entryId} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Contributor: {entry.contributorName ?? entry.createdBy}</p>
                  {Object.entries(entry.data).map(([key, value]) => (
                    <p key={key} className="text-sm text-slate-700"><span className="font-semibold">{key}:</span> {String(value)}</p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No entries yet</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReportPreview;

