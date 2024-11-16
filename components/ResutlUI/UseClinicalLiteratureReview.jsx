export default function UseClinicalLiteratureReview({ literature }) {
	return (<section>
		{literature == null ? "" : (
			<div>
				<h6>Clinical Notes</h6> <div dangerouslySetInnerHTML={{ __html: literature }} />
			</div>
		)}
	</section>)
}
