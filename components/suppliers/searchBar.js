import React from 'react'

export default function SUPPLIERS_SEARCH_BAR({searchhandler}) {
 const { searchvalue, setSearchValue } = React.useState('');
 return (
  <div className='d-flex justify-content-left mt-3 mb-1' style={{margin:' 0 3%'}}>
   <input type='search'
    placeholder='search for supllier'
    className='form-control'
    onChange={(e) => searchhandler(e)}
    style={{ width: '20%' }} />
  </div>
 )
}
