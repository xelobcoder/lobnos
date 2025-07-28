export default function UseDisclaimer({ disclaimer }) {
	return (
		<>
			<div style={{ fontSize: "13px" }}>
				PLEASE NOTE:
				<br />
				{disclaimer ? (
					<span>
						{disclaimer}
					</span>
				) : (
					<span>
						This modality has its own limitations and the impression should be considered only as a professional opinion and correlated with
						clinical and other relevant patient data.
					</span>
				)}
			</div>
		</>
	)
}
