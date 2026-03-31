interface StatusBadgeProps {
  status: "completed" | "in_progress" | "pending";
}

const statusClasses: Record<StatusBadgeProps["status"], string> = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  pending: "bg-rose-100 text-rose-700 border-rose-200",
};

const labels: Record<StatusBadgeProps["status"], string> = {
  completed: "Completed",
  in_progress: "In Progress",
  pending: "Pending",
};

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}>
    {labels[status]}
  </span>
);

export default StatusBadge;
