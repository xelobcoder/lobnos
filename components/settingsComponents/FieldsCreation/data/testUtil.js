import { customPost } from "../../../Auth/customPost";

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
    hasunits: false,
    units: "",
    plan: "",
    plain: "",
    fieldConstraints: [],
    ordering: "",
    isValueTracked: 0,
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