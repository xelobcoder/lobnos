import {
  RiNotificationLine,
  RiStopCircleLine,
  RiSwap2Line,
} from "@remixicon/react";
import { customPost } from "../../../Auth/customFetch";
export const handleCreationMasterRUle = function (ev, field) {
  const { value } = ev.target;
  return { ...field, plan: value };
};

export const updateFieldsRules = async (data, testid) => {
  if (data.length === 0) throw new Error("Add at least one parameter before saving.");
  const dataWithPlan = data.map((item, index) => ({
    ...item,
    ordering: index,
    plan: item.plan || item.type || "",
  }));

  const response = await customPost("testpanel/list/customtestrule", "PUT", {
    testid,
    data: dataWithPlan,
  });
  if (response?.status !== true) throw new Error(response?.message || "Test fields could not be saved.");
  return response;
};

export const defaultConstraintsFields = {
  parameter: "",
  condition: "",
  target: "",
  inRange: false,
};

export const allowedDelimiters = ["-"];

export const specialCharacters = [
  "!", // Exclamation mark
  '"', // Double quote
  "#", // Hash
  "$", // Dollar sign
  "%", // Percent
  "&", // Ampersand
  "'", // Single quote
  "(", // Left parenthesis
  ")", // Right parenthesis
  "*", // Asterisk
  "+", // Plus sign
  ",", // Comma
  ".", // Period
  "/", // Slash
  ":", // Colon
  ";", // Semicolon
  "<", // Less-than sign
  "=", // Equals sign
  ">", // Greater-than sign
  "?", // Question mark
  "@", // At symbol
  "[", // Left square bracket
  "\\", // Backslash
  "]", // Right square bracket
  "^", // Caret
  "_", // Underscore
  "`", // Grave accent
  "{", // Left curly brace
  "|", // Vertical bar
  "}", // Right curly brace
  "~", // Tilde
];

export const defaultConstaints = {
  alert: 1,
  constraint: 2,
  replacementText: "",
  valueAlert: "",
  prefix: "",
  suffix: "",
};

export const defaultCreationRule = {
  name: "",
  field: "",
  value: "",
  options: "",
  testid: "",
  category: "",
  categoryid: "",
  undercategory: 0,
  hasunits: false,
  units: "",
  plan: "",
  plain: "",
  textReference: "",
  fieldConstraints: [],
  ordering: "",
  isValueTracked: 0,
  textReference: "",
  isRequired: false,
  lowerLimit: "",
  upperLimit: "",
  upperLimitFemale: null,
  lowerLimitFemale: null,
  upperLimitMale: null,
  lowerLimitMale: null,
  upperLimitChildren: null,
  lowerLimitChildren: null,
  upperLimitNeonates: null,
  lowerLimitNeonates: null,
};

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
      upperlimit: upperlimit,
    };
  }

  return result;
};

export const CONSTRAINTSLEVEL = [
  {
    value: 0,
    description: "select an option here",
    symbol: "",
    shortcut: "null",
  },
  { value: 1, description: "less than value", symbol: "<", shortcut: "less" },
  {
    value: 2,
    description: "greater than value",
    symbol: ">",
    shortcut: "greater",
  },
  { value: 3, description: "match value", symbol: "=", shortcut: "match" },
  {
    value: 4,
    description: "does not match value",
    symbol: "≠",
    shortcut: "notmatch",
  },
  { value: 5, description: "between value", symbol: "∈", shortcut: "between" },
  {
    value: 6,
    description: "contains value",
    symbol: "∈",
    shortcut: "contains",
  },
];

export const ALERT_OPTIONS = [
  {
    value: 0,
    label: "Select Alert Type",
    description: "Choose how to handle the value",
    action: "none",
  },
  {
    value: 1,
    label: "Alert Value",
    description: "Notify when condition is met",
    action: "alert",
  },
  {
    value: 2,
    label: "Ignore Value",
    description: "Skip notification for this value",
    action: "ignore",
  },
  {
    value: 3,
    label: "Replace Value",
    description: "Replace with custom text",
    action: "replace",
  },
  {
    value: 4,
    label: "prefix",
    description: "Add prefix to the value",
    action: "prefix",
  },
  {
    value: 5,
    label: "suffix",
    description: "Add suffix to the value",
    action: "suffix",
  },
  {
    value: 6,
    label: "prefix-suffix",
    description: "Add prefix and suffix to the value",
    action: "prefix-suffix",
  },
];

export const constraintsFormatting = (fieldConstraints) => {
  if (!Array.isArray(fieldConstraints) || fieldConstraints.length == 0) return;
  return (
    <div>
      {fieldConstraints.map((item, index) => {
        const { alert, constraint, valueAlert } = item;
        return (
          <span key={index}>
            {" "}
            {getSymbolForConstraint(constraint)} {valueAlert}{" "}
            {getAlertOptionsAndDisplay(alert)} <br />
          </span>
        );
      })}
    </div>
  );
};

export const textReferenceFormating = (textReference) => {
  if (typeof textReference != "string") return;
  let hasCommaDelimeter = textReference.includes(",");
  const hasNewLineDelimeter = textReference.includes("\n");
  let splittedReferences = null;
  if (hasCommaDelimeter) {
    splittedReferences = textReference.split(",");
  } else if (hasNewLineDelimeter) {
    splittedReferences = textReference.split("\n");
  } else {
    splittedReferences = [];
  }
  if (Array.isArray(splittedReferences) && textReference.length > 0) {
    return splittedReferences.map((item, index) => (
      <span key={index}>
        {item}
        <br />
      </span>
    ));
  }
  return textReference;
};

export const getSymbolForConstraint = (value) => {
  const constraint = CONSTRAINTSLEVEL.find((item) => item.value == value);
  return constraint
    ? `${constraint.description.slice(0, -5)} (${constraint.symbol}) `
    : "";
};

export const getAlertOptionsAndDisplay = (alert) => {
  switch (alert) {
    case 1:
      return <RiNotificationLine className="text-danger" size={16} />;
    case 2:
      return <RiStopCircleLine className="text-muted" size={16} />;
    case 3:
      return <RiSwap2Line className="text-warning" size={16} />;
    default:
      return "";
  }
};
