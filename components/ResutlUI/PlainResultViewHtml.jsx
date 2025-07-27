
export default function PlainResultPrintingViewHtmlGenerator({ fieldItem, index, resultsettings }) {
	const { name, units, value, plain } = fieldItem;

	// Get settings from resultsettings or use defaults
	const settings = resultsettings?.testBody;

	const formatPlain = (plain) => {
		if (!plain) return '';
		return plain.split(/\s+/).map((part, idx) => {
			const match = part.match(/^([^:]+):(.+)$/);
			if (match) {
				return <div key={idx}><b>{match[1].trim()}:</b> {match[2].trim()}</div>;
			} else {
				return <div key={idx}>{part}</div>;
			}
		});
	};

	return (
		<tr
			style={{
				fontSize: `${settings?.fontSize}px`,
				fontFamily: settings?.fontFamily,
				color: settings?.color
			}}
		>
			<td>
				<span style={{ fontWeight: settings?.boldenParameter ? '500' : 'normal' }}>{name}</span>
			</td>
			<td>
				<span style={{ fontWeight: settings?.boldenValue ? '500' : 'normal' }}>{value}</span>
			</td>
			<td>
				<span style={{ fontWeight: settings?.boldenUnits ? '500' : 'normal' }}>{units}</span>
			</td>
			<td colSpan={2}>
				<span >{plain}</span>
			</td>
		</tr>
	);
}