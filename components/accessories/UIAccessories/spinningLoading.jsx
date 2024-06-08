export default function SpinningLoading({color}) {
  return (
    <div class={`${"spinner-border"} color`} role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  );
}
