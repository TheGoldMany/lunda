export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="list">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="list-item skeleton-item">
          <span className="skeleton skeleton-icon" />
          <div className="list-item-body">
            <span className="skeleton skeleton-line" style={{ width: "50%" }} />
            <span className="skeleton skeleton-line" style={{ width: "80%" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MapSkeleton({ height = 260 }: { height?: number }) {
  return <div className="skeleton map-view" style={{ height }} />;
}
