import React, { useState } from 'react'

export default function CustomAutocomplete({ data, placeholder }) {
  const [dataList, setDataList] = useState(data);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleFiltered = function (ev) {
    const { value } = ev.target;
    if (value.length > 0) {
      let f = data.filter((item, index) => { console.log(item == value) })
      console.log(f)
      setDataList(f)
    } else {
      setDataList(data);
    }
  }

  return (
    <div className='custom-autocomplete'>
      <input className='form-control' onClick={(ev) => { setShow(!show) }} value={selected} type='text' placeholder={placeholder} />
      {show && (
        <div className='list' >
          <div className='p-2'>
            <input className='form-control items ' onChange={(ev) => { handleFiltered(ev) }} />
          </div>
          {
            dataList.map((item, index) => {
              return (
                <div className='items' onClick={(ev) => { setSelected(item); setShow(false) }} dataid={index} key={index}>{item}</div>
              )
            })
          }
          <div className='items'>
            + add new item
          </div>
        </div>
      )}
    </div>
  )
}
