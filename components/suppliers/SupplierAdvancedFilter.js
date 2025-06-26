import { Clear, Search } from '@mui/icons-material';
import React from 'react';
import { Button } from 'react-bootstrap';

export default function AdvancedSupplierFilter({ filters, onFilterChange, onFilterSubmit, loading }) {
      return (
            <div className='card-header d-flex justify-content-between'>
                  <h5>Advanced Filter</h5>
                  <form onSubmit={onFilterSubmit} className='d-flex justify-content-between mx-2'>
                        <div className='form-group '>
                              <input
                                    type='text'
                                    className='custom-input'
                                    placeholder='Supplier name'
                                    name='name'
                                    value={filters.name}
                                    onChange={onFilterChange}
                              />
                        </div>
                        <div className='form-group mx-2'>
                              <input
                                    type='text'
                                    className='custom-input'
                                    placeholder='Email'
                                    name='email'
                                    value={filters.email}
                                    onChange={onFilterChange}
                              />
                        </div>
                        <div className='form-group mx-2'>
                              <input
                                    type='text'
                                    className='custom-input'
                                    placeholder='Contact Person'
                                    name='contactperson'
                                    value={filters.contactperson}
                                    onChange={onFilterChange}
                              />
                        </div>
                        <button type='submit' className='btn btn-primary btn-sm mx-2' disabled={loading}><Search /> Filter Supplier </button>
                        <Button variant='danger' className='btn-sm'>
                             <Clear/> reset filtering 
                        </Button>
                  </form>
            </div>
      );
}
