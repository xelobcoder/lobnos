export default function OptionsResultViewHtmlGenerator({ fieldItem, index, resultsettings }) {
	const { name, units, value } = fieldItem;
	const settings = resultsettings?.testBody;

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
				<span style={{ fontWeight: settings?.boldenParameter ? '500' : 'normal',width:'50%' }}>{name}</span>
			</td>
			<td>
				<span style={{ fontWeight: settings?.boldenValue ? '500' : 'normal',width:'15%' }}>{value}</span>
			</td>
			<td>
				<span style={{ fontWeight: settings?.boldenUnits ? '500' : 'normal',width:'15%' }}>{units}</span>
			</td>
			<td></td>
		</tr>
	);
}
