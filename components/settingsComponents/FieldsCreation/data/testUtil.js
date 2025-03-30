import { NotificationAdd, NotStarted, SwapVertTwoTone } from "@mui/icons-material";
import { customPost } from "../../../Auth/customFetch";

export const handleCreationMasterRUle = function (ev, field) {
	const { value } = ev.target;
	return { ...field, plan: value }
}


export const updateFieldsRules = async (data, toast, testid) => {
	if (data.length === 0) return;
	for (let i = 0; i < data.length; i++) {
		if (isNaN(data[i]["ordering"])) {
			data[i]["ordering"] = i;
		}
	}
	let orderedData = data.sort((a, b) => a.ordering - b.ordering);
	const response = await customPost("testpanel/list/customtestrule", "PUT", { testid, data: orderedData });
	if (response.status === true) {
		toast.success("Test fields updated successfully", { autoClose: 500 });
	} else {
		toast.error(response?.message || "Test fields creation failed", { autoClose: 2000 });
	}
};



export const defaultConstraintsFields = {
	parameter: "",
	condition: "",
	target: "",
	inRange: false,
}


export const allowedDelimiters = ['-'];

export const specialCharacters = [
	'!',  // Exclamation mark
	'"',  // Double quote
	'#',  // Hash
	'$',  // Dollar sign
	'%',  // Percent
	'&',  // Ampersand
	"'",  // Single quote
	'(',  // Left parenthesis
	')',  // Right parenthesis
	'*',  // Asterisk
	'+',  // Plus sign
	',',  // Comma
	'.',  // Period
	'/',  // Slash
	':',  // Colon
	';',  // Semicolon
	'<',  // Less-than sign
	'=',  // Equals sign
	'>',  // Greater-than sign
	'?',  // Question mark
	'@',  // At symbol
	'[',  // Left square bracket
	'\\', // Backslash
	']',  // Right square bracket
	'^',  // Caret
	'_',  // Underscore
	'`',  // Grave accent
	'{',  // Left curly brace
	'|',  // Vertical bar
	'}',  // Right curly brace
	'~',  // Tilde
];

export const defaultConstaints = {
	alert: 1,
	constraint: 2,
	replacementText: '',
	valueAlert: "",
	prefix: '',
	suffix: ''
}

export const defaultCreationRule = {
	name: "",
	field: "",
	value: "",
	options: "",
	testid: "",
	category: "",
	undercategory: 0,
	hasunits: false,
	units: "",
	plan: "",
	plain: "",
	fieldConstraints: [],
	ordering: "",
	isValueTracked: 0,
	textReference: ""
}



export const parseTextToObject = function (text) {
	const pattern = /(\w+):\s*(\d+)\s*-\s*(\d+)\s*;?/g;
	const result = {};
	let match;
	while ((match = pattern.exec(text)) !== null) {
		const category = match[1].toLowerCase().trim();
		const lowerlimit = parseInt(match[2].trim(), 10);
		const upperlimit = parseInt(match[3].trim(), 10);
		result[category] = {
			lowerlimit: lowerlimit,
			upperlimit: upperlimit
		};
	}

	return result;
}




export const CONSTRAINTSLEVEL = [
	{ value: 0, description: 'select an option here', symbol: '' },
	{ value: 1, description: 'less than value', symbol: '<' },
	{ value: 2, description: 'greater than value', symbol: '>' },
	{ value: 3, description: 'match value', symbol: '=' },
	{ value: 4, description: 'does not match value', symbol: '≠' }
];




export const ALERT_OPTIONS = {
	0: 'select an option below',
	1: 'alert',
	2: 'do not alert',
	3: 'replace value with custom text'
};


export const constraintsFormatting = (fieldConstraints) => {
	if (!Array.isArray(fieldConstraints) || fieldConstraints.length == 0) return;
	return (
		<div>
			{fieldConstraints.map((item, index) => {
				const { alert, constraint, valueAlert } = item;
				return <span key={index}> {getSymbolForConstraint(constraint)}  {valueAlert}    {getAlertOptionsAndDisplay(alert)}       <br /></span>
			})}
		</div>
	)
}


export const textReferenceFormating = (textReference) => {
	if (typeof textReference != "string") return;
	let hasCommaDelimeter = textReference.includes(",");
	const hasNewLineDelimeter = textReference.includes("\n");
	let splittedReferences = null;
	if (hasCommaDelimeter) {
		splittedReferences = textReference.split(',')
	} else if (hasNewLineDelimeter) {
		splittedReferences = textReference.split('\n')
	} else {
		splittedReferences = []
	}
	if (Array.isArray(splittedReferences) && textReference.length > 0) {
		return splittedReferences.map((item, index) => <span key={index}>{item}<br /></span>)
	}
	return textReference;
}


export const getSymbolForConstraint = (value) => {
	const constraint = CONSTRAINTSLEVEL.find(item => item.value == value);
	return constraint ? `${constraint.description.slice(0, -5)} (${constraint.symbol}) ` : '';
};

export const getAlertOptionsAndDisplay = (alert) => {
	switch (alert) {
		case 1:
			return <NotificationAdd color="error" />
		case 2:
			return <NotStarted />
		case 3:
			return <SwapVertTwoTone />
		default:
			return ''

	}
}
