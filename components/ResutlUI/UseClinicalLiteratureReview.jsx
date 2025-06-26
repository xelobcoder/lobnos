export default function UseClinicalLiteratureReview({ literature }) {
	const isLiterature = literature && typeof literature === "string" && literature.length > 0;
	return (
	<section>
		{isLiterature  && <h5>Clinical Notes</h5>}
		{ isLiterature &&
		<div dangerouslySetInnerHTML={{ __html: literature }} />
		}
	</section>)
}
