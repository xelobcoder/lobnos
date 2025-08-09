export default function UseClinicalLiteratureReview({ literature }) {
	console.log("UseClinicalLiteratureReview", literature);
	const isLiterature = literature && typeof literature === "string" && literature.length > 0;
	return (
	<section>
		{isLiterature   && <div className="fw-bold">Clinical Notes</div>}
		{ isLiterature &&
		<div dangerouslySetInnerHTML={{ __html: literature }} />
		}
	</section>)
}
