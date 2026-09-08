export default function EmptyState({ icon = "🗂️", title = "Nothing here yet", hint = "" }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-title">{title}</p>
      {hint && <p className="muted small">{hint}</p>}
    </div>
  );
}