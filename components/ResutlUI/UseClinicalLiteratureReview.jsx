import styles from '../Drugs/DrugsList.module.css';

export default function UseClinicalLiteratureReview({ literature }) {
	const isLiterature = literature && typeof literature === "string" && literature.trim().length > 0;

	return (
		<section className={styles.section}>
			{isLiterature && (
				<div className={styles.heading}>
					<h3 className={styles.title}>Clinical Notes</h3>
				</div>
			)}
			{isLiterature && (
				<div
					className={styles.richContent}
					dangerouslySetInnerHTML={{ __html: literature }}
				/>
			)}
		</section>
	);
}
