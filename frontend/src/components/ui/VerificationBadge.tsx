import { VerificationStatus } from "../../types";

interface VerificationBadgeProps {
  status?: VerificationStatus;
}

const VerificationBadge = ({ status = "pending" }: VerificationBadgeProps) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-rose-100 text-rose-800 border-rose-200",
  };

  const icons = {
    pending: "⏳",
    approved: "✓",
    rejected: "✕",
  };

  const labels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      <span>{icons[status]}</span>
      {labels[status]}
    </span>
  );
};

export default VerificationBadge;
