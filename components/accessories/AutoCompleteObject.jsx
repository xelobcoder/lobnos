import { Close } from "@mui/icons-material";
import React, { useEffect, useState } from "react";

const AutoCompleteObject = ({ options }) => {
  const [showClose, setShowClose] = useState(false);
  const {
    target,
    filter,
    data = [],
    tabindex,
    handleSelected,
    placeholder,
    inputValue,
    setInputValue,
  } = options;


  const handleClose = () => {
    setInputValue("");
    setShowClose(false);
    setFilteredOptions(data);
  }

  const [computedTabindex, setComputedTabindex] = useState(tabindex);
  const [filteredOptions, setFilteredOptions] = useState([]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    setShowClose(false);

    if ((target, filter, data && data.length && Array.isArray(data))) {
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
      setShowClose(true);
    }
  };

  const handleOptionClick = (option) => {
    handleSelected(option);
    setFilteredOptions([]);
    setShowClose(true);
  };

useEffect(() => {
  // filtered options should be emptied when the body of the document is clicked
  document.body.addEventListener('click', (ev) => {
    setFilteredOptions([]);
  });
}, []);


  return (
    <div className={`custom-autocomplete`}>
      <div className="custom-head">
      <input
        type="text"
          tabIndex={tabindex}
          className={`auto-input  ${inputValue.length > 0  || filteredOptions.length > 0 ? 'lower-borders-none' : ''}`}
        placeholder={placeholder}
        value={inputValue}
        onChange={(ev) => {
          handleInputChange(ev)
        }}
        onClick={(ev) => {
          setFilteredOptions(data);
        }}
      />
     {showClose && ( <span onClick={(ev) => {handleClose(ev)}} className="span-close"><Close color='primary'/></span>)}
     </div>
      <div className={`custom-body ${filteredOptions.length > 0 ? '' : 'border-0'}`}>
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
    </div>
  );
};

export default AutoCompleteObject;
