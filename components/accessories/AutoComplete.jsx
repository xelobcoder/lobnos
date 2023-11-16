import React, { useState ,useRef, useEffect} from 'react'

export default function CustomAutocompleteList({ data, placeholder,tabindex,selected,setSelected }) {
  const [computedTabindex,setComputedTabindex] = useState(tabindex);
  const [dataList, setDataList] = useState(data);
  const [show, setShow] = useState(false);
  const [filteringValue, setFilteringValue] = useState('');
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const handleFiltered = function (ev) {
    const value = ev.target.value;
    setFilteringValue(value);
    setDataList(data);
    if (value) {
      const filteredData = data.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
      setDataList(filteredData);
      setShow(true);
    } else {
      setDataList(data);
      setShow(false);
    }
  }

  useEffect(() => {
    if (selected) {
      setFilteringValue(selected);
      setShow(false);
    }
  }, [selected]);




  const listKeyDown = (ev) => {
    if (ev.code === 'ArrowDown' || ev.code === 'Enter') {
     const dataid = ev.target.getAttribute('dataid');
     const filteredData = dataList[dataid];
      setSelected(filteredData);
    }
  }
 

  

  return (
    <div  className='custom-autocomplete mx-3 my-4'>
      <label>{placeholder}</label>
      <input ref={inputRef} className='form-control'  tabIndex={tabindex} onChange={(ev) => { handleFiltered(ev) }} value={filteringValue} type='text' placeholder={placeholder} />
      {show && (
        <div className='custom-autocomplete-list' >
          {dataList.map((item, index) => (
            <li ref={listRef}  dataid={index} onKeyDown={(ev) => {listKeyDown(ev)}} tabIndex={computedTabindex+(index+1)}    className='list' key={index} onClick={(ev) => { setSelected(item) }}>{item}</li>
          ))}
        </div>  
      )}
     </div>
  )
}
