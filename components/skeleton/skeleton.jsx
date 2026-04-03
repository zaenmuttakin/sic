export default function Skeleton({
  width = "w-full",
  height = "h-4",
  className = "",
}) {
  return (
    <div
      className={`animate-pulse bg-indigo-100 rounded ${width} ${height} ${className}`}
    />
  );
}
