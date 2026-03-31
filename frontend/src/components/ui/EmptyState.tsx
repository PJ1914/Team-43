interface EmptyStateProps {
  title?: string;
  description?: string;
}

const EmptyState = ({ title = "No entries yet", description = "Start by adding your first entry." }: EmptyStateProps) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
};

export default EmptyState;
