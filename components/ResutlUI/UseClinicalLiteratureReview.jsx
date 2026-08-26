export default function UseClinicalLiteratureReview({ literature }) {
	const isLiterature = literature && typeof literature === "string" && literature.trim().length > 0;
	const appFontStyle = "font-family: var(--theme-font-family, var(--bs-body-font-family, inherit)); font-size: var(--bs-body-font-size, 14px); line-height: 1.5; color: inherit;";

	const literatureHtml = (() => {
		if (!isLiterature) return "";
		return literature
			.replace(/<table\b/gi, `<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;${appFontStyle}"`)
			.replace(/<th\b/gi, `<th style="padding:4px;border:1px solid #0f0e0e;text-align:left;vertical-align:top;${appFontStyle}"`)
			.replace(/<td\b/gi, `<td style="padding:4px;border:1px solid #010101;text-align:left;vertical-align:top;${appFontStyle}"`)
			.replace(/<tr\b/gi, '<tr style="vertical-align:top;"')
			.replace(/<figure\b/gi, '<figure style="margin:0.5rem 0;overflow-x:auto;"');
	})();

	return (
		<section>
			{isLiterature && <div className="fw-bold">Clinical Notes</div>}
			{isLiterature && (
				<div
					className="literature-content"
					style={{
						fontFamily: "var(--theme-font-family, var(--bs-body-font-family, inherit))",
						fontSize: "var(--bs-body-font-size, 14px)",
						lineHeight: 1.5,
						color: "inherit",
					}}
					dangerouslySetInnerHTML={{ __html: literatureHtml }}
				/>
			)}
		</section>
	);
}
