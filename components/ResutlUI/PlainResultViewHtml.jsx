
export default function PlainResultPrintingViewHtmlGenerator({ fieldItem }) {
	const { name, units, value, plain } = fieldItem;

	// Format the plain string into lines with bolded group labels (any label: value)
	const formatPlain = (plain) => {
		if (!plain) return '';
		// Split by space, then by colon
		return plain.split(/\s+/).map((part, idx) => {
			const match = part.match(/^([^:]+):(.+)$/);
			if (match) {
				return <div key={idx}><b>{match[1].trim()}:</b> {match[2].trim()}</div>;
			} else {
				// If not matching, just show as is
				return <div key={idx}>{part}</div>;
			}
		});
	};

	return (
		<tr>
			<td>{">"}{name}</td>
			<td>{value}</td>
			<td>{units}</td>
			<td colSpan={2}>{formatPlain(plain)}</td>
		</tr>
	);
}