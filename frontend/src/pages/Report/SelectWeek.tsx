import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useAuthStore } from "../../hooks/useAuthStore";
import Spinner from "../../components/ui/Spinner";

const SelectWeek = () => {
  const { departments, isLoaded } = useConfigStore((state) => ({ departments: state.departments, isLoaded: state.isLoaded }));
  const { profile } = useAuthStore();
  const [department, setDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isFaculty = profile?.role === "faculty";
  const isDepartmentLocked = isFaculty;

  // Auto-select department for faculty users
  useEffect(() => {
    if (isFaculty && profile?.department) {
      setDepartment(profile.department);
    }
  }, [isFaculty, profile?.department]);

  const handleCreateWeek = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ reportId: string }>("/reports/create-week", { department, startDate, endDate });
      navigate(`/report/${data.reportId}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <Spinner label="Loading configuration..." />;
  }

  return (
    <div className="max-w-xl rounded-2xl bg-white p-6 shadow-panel">
      <h1 className="text-2xl font-bold text-slate-800">Create Weekly Report</h1>
      <p className="mt-1 text-sm text-slate-500">
        {isFaculty ? `Creating report for ${profile?.department} department.` : "Pick the department and reporting window for collaboration."}
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleCreateWeek}>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Department <span className="text-rose-500">*</span></label>
          <select 
            className="w-full rounded-lg border border-slate-300 px-4 py-2 disabled:bg-slate-100 disabled:text-slate-600" 
            value={department} 
            onChange={(event) => setDepartment(event.target.value)} 
            disabled={isDepartmentLocked}
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {isDepartmentLocked && (
            <p className="mt-1 text-xs text-slate-500">You can only create reports for your assigned department.</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Start Date</label>
          <input type="date" className="w-full rounded-lg border border-slate-300 px-4 py-2" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">End Date</label>
          <input type="date" className="w-full rounded-lg border border-slate-300 px-4 py-2" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white disabled:bg-brand-300">
          {loading ? "Creating..." : "Create Week"}
        </button>
      </form>
    </div>
  );
};

export default SelectWeek;
