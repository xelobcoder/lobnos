
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
				color: settings?.color,
				width: '100%'
			}}
		>
			<td>
				<span style={{ fontWeight: settings?.boldenParameter ? '500' : 'normal' ,width:'45%'}}>{name}</span>
			</td>
			<td>
				<span style={{ fontWeight: settings?.boldenValue ? '500' : 'normal' ,width:'20%'}}>{value}</span>
			</td>
			<td>
				<span style={{ fontWeight: settings?.boldenUnits ? '500' : 'normal' ,width:'10%'}}>{units}</span>
			</td>
			<td  style={{ width: '25%' }} colSpan={2}>
				<span >{plain}</span>
			</td>
		</tr>
	);
}