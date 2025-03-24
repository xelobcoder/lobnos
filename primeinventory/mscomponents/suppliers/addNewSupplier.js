import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { regions, defaultSupplierdata, getDataAndUpdateState } from '../Auth/customFetch';
import Loader from '../accessories/Loader';


const schema = yup.object().shape({
      name: yup.string().required(),
      address: yup.string(),
      email: yup.string().email().required(),
      phonenumber: yup.string().length(10).matches(/^\d{10}$/).required(),
      region: yup.string(),
      contactperson: yup.string(),
});

export default function ADD_NEW_SUPPLIER({ supplierid, isEditing, handleAddNew, reset }) {
      const { register, handleSubmit, reset: resetForm, setValue, formState: { errors } } = useForm({
            resolver: yupResolver(schema),
            defaultValues: defaultSupplierdata,
      });
  
      const [loading, setLoading] = useState(false);

      const getEditRecord = useCallback(async () => {
            if (isEditing && supplierid) {
                  setLoading(true);
                  try {
                        const data = await getDataAndUpdateState(null, `suppliers/getsupplier?supplierid=${supplierid}`, true);
                        resetForm(data[0]);
                  } catch (err) {
                        console.log(err)
                        alert('Something went wrong');
                  } finally {
                        setLoading(false);
                  }
            }
      }, [supplierid, isEditing, resetForm]);

      useEffect(() => {
            getEditRecord();
      }, [getEditRecord]);

      const onSubmit = async (data) => {
            try {
                  await handleAddNew(data);
                  resetForm();
            } catch (error) {
                  console.error('Error submitting form:', error);
            }
      };

      const renderingView = () => {
            if (loading) return <Loader />;
            return (
                  <div className='card ui'>
                        <div className="card-header d-flex justify-content-between">
                              <h5>{isEditing ? 'Update supplier information' : 'Add New supplier'}</h5>
                              {isEditing && (
                                    <button onClick={() => { resetForm(defaultSupplierdata); }} className='btn btn-danger btn-sm'>Reset</button>
                              )}
                        </div>
                        <div className='card-body'>
                              <form className='grid grid-50' onSubmit={handleSubmit(onSubmit)}>
                                    <div className='form-group'>
                                          <label className='my-1' htmlFor='name'>Name</label>
                                          <input
                                                className='custom-input'
                                                {...register('name')}
                                                onChange={(e) => setValue('name', e.target.value)}
                                                placeholder='Supplier name'
                                          />
                                          {errors.name && <small className="text-danger">{errors.name.message}</small>}
                                    </div>
                                    <div className='form-group'>
                                          <label className='my-1' htmlFor='email'>Email</label>
                                          <input
                                                className='custom-input'
                                                type='email'
                                                {...register('email')}
                                                onChange={(e) => setValue('email', e.target.value)}
                                                placeholder='Email'
                                          />
                                          {errors.email && <small className="text-danger">{errors.email.message}</small>}
                                    </div>
                                    <div className='form-group'>
                                          <label className='my-1' htmlFor='phonenumber'>Phone Number</label>
                                          <input
                                                className='custom-input'
                                                type='tel'
                                                maxLength={10}
                                                minLength={10}
                                                {...register('phonenumber')}
                                                onChange={(e) => setValue('phonenumber', e.target.value)}
                                                placeholder='Phone number'
                                          />
                                          {errors.phonenumber && <small className="text-danger">{errors.phonenumber.message}</small>}
                                    </div>
                                    <div className='form-group'>
                                          <label className='my-1' htmlFor='address'>Address</label>
                                          <input
                                                className='custom-input'
                                                {...register('address')}
                                                onChange={(e) => setValue('address', e.target.value)}
                                                placeholder='Address'
                                          />
                                          {errors.address && <small className="text-danger">{errors.address.message}</small>}
                                    </div>
                                    <div className='form-group'>
                                          <label className='my-1' htmlFor='region'>Region</label>
                                          <select
                                                className='custom-select'
                                                {...register('region')}
                                                onChange={(e) => setValue('region', e.target.value)}
                                          >
                                                <option value=''>Select region</option>
                                                {regions.map((item, index) => (
                                                      <option key={index} value={item}>{item}</option>
                                                ))}
                                          </select>
                                          {errors.region && <small className="text-danger">{errors.region.message}</small>}
                                    </div>
                                    <div className='form-group'>
                                          <label className='my-1' htmlFor='contactperson'>Contact Person</label>
                                          <input
                                                className='custom-input'
                                                {...register('contactperson')}
                                                onChange={(e) => setValue('contactperson', e.target.value)}
                                                placeholder='Contact person'
                                          />
                                          {errors.contactperson && <small className="text-danger">{errors.contactperson.message}</small>}
                                    </div>
                                    <div className='form-group mt-2'>
                                          <button
                                                className='btn btn-primary btn-sm'
                                                type='submit'
                                          >
                                                {isEditing ? 'Update supplier information' : 'Add New supplier'}
                                          </button>
                                    </div>
                              </form>
                        </div>
                  </div>
            );
      };

      return <div className='p-2'>{renderingView()}</div>;
}
