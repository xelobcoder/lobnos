import React, { useState } from "react";

const AutoCompleteObject = ({ options }) => {
  const {
    target,
    filter,
    data,
    tabindex,
    handleSelected,
    selected,
    placeholder,
  } = options;
  const [inputValue, setInputValue] = useState(selected[target]);
  const [computedTabindex, setComputedTabindex] = useState(tabindex);
  const [filteredOptions, setFilteredOptions] = useState([]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);

    if ((target, filter, data && data.length > 0)) {
      const filtered = data.filter((option) => {
        if (filter == "contains") {
          return option[target].toLowerCase().includes(value.toLowerCase());
        } else {
          return option[target].toLowerCase().startsWith(value.toLowerCase());
        }
      });
      setFilteredOptions(filtered);
    } else {
      throw new Error("Please provide the required props");
    }
  };

  const onKeyDown = (ev, option) => {
    if (ev.code === "ArrowDown" || ev.code === "Enter") {
      handleSelected(option);
      setFilteredOptions([]);
    }
  };

  const handleOptionClick = (option) => {
    handleSelected(option);
    setFilteredOptions([]);
  };

  console.log(selected);

  return (
    <div className="custom-autocomplete mx-3">
      <input
        type="text"
        tabIndex={tabindex}
        className="form-control"
        placeholder={placeholder}
        value={inputValue}
        onChange={(ev) => {
          handleInputChange;
        }}
        onClick={(ev) => {
          setFilteredOptions(data);
        }}
      />
      {filteredOptions.length > 0 && (
        <div className="custom-autocomplete-list">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              tabIndex={computedTabindex + (index + 1)}
              className="list"
              dataid={index}
              onKeyDown={(ev) => {
                onKeyDown(ev, option);
              }}
              onClick={() => handleOptionClick(option)}
            >
              {option[target]}
            </li>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteObject;
