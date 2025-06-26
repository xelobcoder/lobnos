

export default function UseResultCommentSinglePreview({ comments }) {

	return (
		<div>
			{comments && comments.length > 0 &&  <h5>Comments</h5>}
			{comments && comments.length > 0 && <div dangerouslySetInnerHTML={{ __html: comments }} />}
			
			<hr className="p-0 "/>
			<span className="text-muted d-flex justify-content-center text-sm">******End of Report ******</span>
		</div>
	)
}
