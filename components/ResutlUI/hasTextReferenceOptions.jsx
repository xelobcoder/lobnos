
export default function HasTextReferenceOptionsResultView({ fieldItem }) {
	const { name, units, value, textReference } = fieldItem;

	return <tr>
		<td>{"> "}{name}</td>
		<td>{value}</td>
		<td>{units}</td>
		{/* <td>{textReferenceFormating(textReference)}</td> */}
	</tr>
}