import { Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { customFetch, customPost, validateFormData } from '../../components/Auth/customFetch';
import { DeleteForever } from '@mui/icons-material';
import InventoryLayout from '../../components/inventory/InventoryLayout';

export default function StockCategory() {
  const [categoryList, setCategorylist] = useState([])
  const [category, setCategory] = useState('');

  const handleSubmit = async (e) => {
    await validateFormData({ category }, true, [], 'stock/category', function (response) {
      const { statusCode, status, message } = response;
      statusCode == 201 && status == 'success' ? alert(message) : alert('error in adding new category')
      fetchResponse();
    })
  }

  const fetchResponse = async function () {
    const response = await customFetch('stock/category');
    setCategorylist(response);
  }


  const deleteCat = async function (id) {
    const confirmation = confirm('Do you want to delete this category. This will affect stock category records');

    if (confirmation) {
      const response = await customPost('stock/category', 'DELETE', { id });
      console.log(response);
      if (response) {
        const { statusCode, message, status } = response;
        if (statusCode == 200 && status == 'success') {
          fetchResponse()
        }
        alert(message)
      }
    } else {
      return
    }
  }

  useEffect(() => {
    fetchResponse();
  }, [])

  return (
    <InventoryLayout>
      <div className='container-fluid' >
        <div className='container'>
          <div className='category-stock-wrapper'>
            <div >
              <form>
                <label>category name</label>
                <input className='custom-input' type='text' value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <button className='custom-button mt-2' type='button' onClick={handleSubmit}>
                  save information
                </button>
              </form>
            </div>
            <div >
              <div className='card mt-1' style={{ borderRadius: '5px' }}>
                <div className='card-header'>
                  <h6 className='lead text-capitalize'> category list</h6>
                </div>
                <div className='card-body' style={{ padding: 0 }}>
                  {
                    categoryList.map((item, index) => {
                      return (
                        <div key={index} >
                          <div className='category-stock'>
                            <div className='category'>
                              {item?.category}
                            </div>
                            <div>
                              <Button color='error' className='mt-1' variant='contained' size='small' onClick={(e) => deleteCat(item?.id)}>
                                <DeleteForever />
                                delete
                              </Button>
                            </div>
                          </div>
                        </div>)
                    })
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InventoryLayout>
  )
}
