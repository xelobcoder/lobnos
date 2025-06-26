export default function SpinningLoading({ color }) {
  return (
    <div className="d-flex align-items-center">
      <span className={`spinner-border spinner-border-sm ${color}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </span>
    </div>
  );
}
