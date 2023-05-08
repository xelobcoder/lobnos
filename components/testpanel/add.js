import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
import React, { useContext, useState, useMemo } from 'react';
import { customFetch, customPost } from '../Auth/customFetch';
import { Container } from '@mui/material';

export default function AddPanel() {
  const defaultValue = { test: '', price: 0, category: '', sample: '', description: '', unit: '', samplevolume: 0, samplecontainer: '' }
  const [test, setTest] = useState(defaultValue)
  const [categories, setCategories] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTest({ ...test, [name]: value })
  }

  // get all categories 

  useMemo(async () => {
    const response = await customFetch('testpanel/categories');
    setCategories(response)
  }, [])


  const handleSubmit = async (e) => {
    e.preventDefault();
    let push = await customPost('testpanel/list', 'POST', test);
    const { status, message, statusCode } = push;
    if (status === 'success') {
      alert(message)
      setTest(defaultValue)
    } else {
      alert(message)
    }
  }
  return (
    <>
      <main>
        <Container sx={{ backgroundColor: 'whitesmoke', padding: '20px' }}>
          <header className='mb-3'>
            <h4> Add a new test</h4>
          </header>
          <form >
            <div className='form-group mt-3'>
              <label> test name</label>
              <input className='custom-input' type='text' name='test' value={test.test} onChange={handleChange} placeholder=' Test' />
            </div>
            <div className='form-group mt-3'>
              <label>price</label>
              <input className='custom-input' type='number' name='price'
                onChange={handleChange} placeholder='Price' value={test.price} />
            </div>
            <div className='form-group mt-3'>
              <label>category</label>
              <select className='custom-input' name='category' value={test.category}
                onChange={handleChange}>
                <option value=''>select category</option>
                {categories.map((item, index) => (
                  <option key={index} value={item.CATEGORY}>{item.CATEGORY}</option>
                ))}
              </select>
            </div>
            {/* sample  */}
            <div className='form-group mt-3'>
              <label>sample</label>
              <select className='custom-input' name='sample' value={test.sample}
                onChange={handleChange}>
                <option value=''>select sample</option>
                <option value='blood'>blood</option>
                <option value='urine'>urine</option>
                <option value='stool'>stool</option>
                <option value='swab'>swab</option>
                <option value='serum'>serum</option>
                <option value='other'>other</option>
              </select>
            </div>
            {/* description */}
            <div className='form-group mt-3'>
              <label>description</label>
              <textarea className='custom-textarea' name='description' value={test.description}
                onChange={handleChange} placeholder='description' />
            </div>
            {/* unit */}
            <div className='form-group mt-3'>
              <label>unit</label>
              <input className='custom-input' type='text' name='unit' value={test.unit}
                onChange={handleChange} placeholder='unit' />
            </div>
            {/* sample container */}
            <div className='form-group mt-3'>
              <label>sample container</label>
              <input className='custom-input' type='text' name='samplecontainer' value={test.samplecontainer}
                onChange={handleChange} placeholder='sample container' />
            </div>
            {/* sample volume */}
            <div className='form-group mt-3'>
              <label>sample volume</label>
              <input className='custom-input' type='text' name='samplevolume' value={test.samplevolume}
                onChange={handleChange} placeholder='sample volume' />
            </div>
            <button type='button' className='custom-button mt-3' onClick={handleSubmit}>
              <AddBoxSharpIcon />
              add test
            </button>
          </form>
        </Container>
      </main>
    </>
  )
}



