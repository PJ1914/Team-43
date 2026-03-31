import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import SectionProgressTable from "../../components/report/SectionProgressTable";
import Spinner from "../../components/ui/Spinner";
import { useReportStore } from "../../hooks/useReportStore";

const ReportHome = () => {
  const { weekId = "" } = useParams();
  const { selectedReportSections, loadSectionsForReport } = useReportStore();

  useEffect(() => {
    if (weekId) {
      void loadSectionsForReport(weekId);
    }
  }, [loadSectionsForReport, weekId]);

  if (!selectedReportSections.length) {
    return <Spinner label="Loading sections..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-panel">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Report Workspace</h1>
          <p className="text-sm text-slate-500">Manage all 17 sections collaboratively.</p>
        </div>
        <Link className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white" to={`/report/${weekId}/preview`}>
          Live Preview
        </Link>
      </div>
      <SectionProgressTable weekId={weekId} sections={selectedReportSections} />
    </div>
  );
};

export default ReportHome;
