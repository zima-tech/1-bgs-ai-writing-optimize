export default function DashboardLoading() {
  return (
    <div className="page-stack route-loading">
      <div className="loading-hero">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-short" />
      </div>
      <div className="summary-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="panel-card loading-card" key={index}>
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-short" />
          </div>
        ))}
      </div>
      <div className="panel-card loading-card">
        {Array.from({ length: 8 }).map((_, index) => (
          <div className={`skeleton-line${index % 3 === 2 ? ' skeleton-short' : ''}`} key={index} />
        ))}
      </div>
    </div>
  );
}
