import { Link } from "react-router-dom";
import { Section } from "../../types";
import StatusBadge from "../ui/StatusBadge";

interface SectionProgressTableProps {
  weekId: string;
  sections: Section[];
}

const resolveStatus = (section: Section): "completed" | "in_progress" | "pending" => {
  if (section.completed) {
    return "completed";
  }
  return "pending";
};

const SectionProgressTable = ({ weekId, sections }: SectionProgressTableProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Section</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sections.map((section) => (
            <tr key={section.sectionId}>
              <td className="px-4 py-3 text-sm font-medium text-slate-700">{section.name}</td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge status={resolveStatus(section)} />
              </td>
              <td className="px-4 py-3 text-sm">
                <Link
                  to={`/report/${weekId}/section/${section.sectionId}`}
                  className="rounded-lg bg-brand-100 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-200"
                >
                  Open Section
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SectionProgressTable;
