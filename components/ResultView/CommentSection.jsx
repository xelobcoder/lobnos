export default function ResultCommentSection({ result }) {
  return (
    <div className="mt-3">
      <h6 className="fw-bold">Comments</h6>
      <h6>{result?.["comments"]}</h6>
    </div>
  )
}
