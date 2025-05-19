"use client"
import { useState } from 'react'
import { RiForward10Fill } from '@remixicon/react';

export default function Addcategory() {
  const [categoryList, setCategoryList] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryList({ ...categoryList, [name]: value });
  };

  return (
    <>
          <div className='container'>
            <form>
              <div className='form-group'>
                <label htmlFor='category'>Category</label>
                <input type='text' className='custom-input' id='category' name='category' onChange={handleChange} />
              </div>
              <div className='form-group'>
                <label htmlFor='description'>Description</label>
                <textarea className='form-control' name='description' onChange={handleChange} id='description' rows={3}>
                </textarea>
              </div>
              <button type='button' className='btn btn-primary mt-3'>
                <RiForward10Fill/>
                Submit
              </button>
            </form>
          </div>
    </>
  )
}
