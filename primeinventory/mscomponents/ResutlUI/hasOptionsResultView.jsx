export default function OptionsResultViewHtmlGenerator({ fieldItem }) {
	const { name, units, value } = fieldItem;
	return (
		<tr>
			<td>{name}</td>
			<td>
				{value}
			</td>
			<td>{units}</td>
			<td></td>
		</tr>
	);
}
