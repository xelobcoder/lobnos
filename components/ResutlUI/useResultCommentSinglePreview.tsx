

export default function UseResultCommentSinglePreview({ comments }) {
	return (
		<div>
			{comments && comments.toString().trim().length > 0 && <div className="fw-bold">Comments</div>}
			{comments && comments.toString().trim().length > 0 && <div dangerouslySetInnerHTML={{ __html: comments }} />}
		</div>
	)
}
