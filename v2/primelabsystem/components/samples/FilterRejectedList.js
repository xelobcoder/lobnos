import React from 'react';
import { useState } from 'react';

export default function FilterRejectedList(props) {
 const searchController = props.searchHandler;
 const [searchValue, setSearchedValue] = useState('');

 const handleSearch = (e) => {
  setSearchedValue(e.target.value);
  searchController(e.target.value)
 }
 return (
  <div className='p-1'>
   {/* input field */}
   <div className='input-group mb-3 mt-2'>
    <input type='text' className='form-control' value={searchValue} placeholder='Search' aria-label='Search' aria-describedby='button-addon2' onChange={(e) => handleSearch(e)} />
   </div>
  </div>
 )
}
