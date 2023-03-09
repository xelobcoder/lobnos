import React from 'react'

export default function CommoditiesList({ datasource }) {
  const [commodities, setCommodities] = React.useState(datasource || []);

  const [search, setSearch] = React.useState('');

  const handleSearch = (e) => {
    // empty search once 
    const { value } = e.target;
    const filteredCommodities = datasource.filter(commodity => commodity.name.toLowerCase().includes(value.toLowerCase()));
    setCommodities(filteredCommodities);
  }

  const commodity_click_event = (e) => {
    const { innerText } = e.target;
    setSearch(innerText);
  }

  return (
    <>
      <div className='transaction-header'>
        <h4>commodities</h4>
        <input className='custom-input'   onChange={(e) => handleSearch(e)} placeholder='search here' list='commodities' />
        <datalist id='commodities'>
          <option> edta tubes</option>
          <option> edta tubes</option>
          <option> edta tubes</option>
          <option> edta tubes</option>
          <option> edta tubes</option>
          <option> edta tubes</option>
          <option> edta tubes</option>
          <option> edta tubes</option>
          <option>syringes</option>
          <option>edta tubes</option>
        </datalist>
      </div>
      <div className='transaction-body'>
        {commodities.map((commodity, index) => {
          return (
            <div key={index} className='commodity'>
              <p onClick={(e) => commodity_click_event(e)}>{commodity.name}</p>
            </div>
          )
        })
        }
      </div>
    </>
  )
}
