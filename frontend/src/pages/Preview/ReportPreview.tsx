import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/ui/Spinner";
import { useConfigStore } from "../../hooks/useConfigStore";
import { Entry } from "../../types";

const ReportPreview = () => {
  const { weekId = "" } = useParams();
  const { sections, isLoaded } = useConfigStore((state) => ({ sections: state.sections, isLoaded: state.isLoaded }));
  const [entriesMap, setEntriesMap] = useState<Record<string, Entry[]>>({});
  const [loading, setLoading] = useState(true);

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

  if (!isLoaded || loading) {
    return <Spinner label="Building live report preview..." />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-panel">
        <h1 className="text-2xl font-bold text-slate-800">Live Report Preview</h1>
        <a className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white" href={`${import.meta.env.VITE_API_BASE_URL}/reports/${weekId}/export`}>
          Export PDF
        </a>
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
