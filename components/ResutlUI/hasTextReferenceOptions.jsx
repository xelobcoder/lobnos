
export default function HasTextReferenceOptionsResultView({ fieldItem, index, resultsettings }) {
	const { name, units, value, textReference } = fieldItem;

	// Get settings from resultsettings or use defaults
	const settings = resultsettings?.testBody;

	return (
		<tr
			style={{
				fontSize: `${settings?.fontSize}px`,
				fontFamily: settings?.fontFamily,
				color: settings?.color
			}}
		>
			<td>
				<span style={{ fontWeight: settings?.boldenParameter ? '500' : 'normal' }}>{"> "}{name}</span>
			</td>
			<td>
				<span style={{ fontWeight: settings?.boldenValue ? '500' : 'normal' }}>{value}</span>
			</td>
			<td>
				<span style={{ fontWeight: settings?.boldenUnits ? '500' : 'normal' }}>{units}</span>
			</td>
			<td>{textReference}</td>
		</tr>
	);
}