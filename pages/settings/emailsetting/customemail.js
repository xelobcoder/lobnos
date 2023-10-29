import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar';
import { formats, modulex } from '../../../components/Auth/customFetch';
import { Drafts, Send } from '@mui/icons-material';
import { TextField } from '@mui/material';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function EMAIL_LOGS() {
  const [value, setValue] = useState('');


  return (
    <>
      <MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
        <div className='container'>
          <div className='row '>
            <div className='col p-2' style={{ display: 'grid', gridTemplateColumns: '20% auto', gridGap: '10px' }}>
              <select className='form-control'>
                <option >select category of the recipient</option>
                <option value={'clients'}>client</option>
                <option value={'staff'}>staff</option>
                <option value='bulk clients'>bulk clients</option>
                <option value='bulk staff'>bulk staff</option>
              </select>
              <input multiple type='search' className='form-control' placeholder='search for recipient email' />
            </div>
          </div>
        </div>
        <div className='container p-2'>
          <div className='form-row '>
            <label>subject</label>
            <TextField variant='filled' className='col-12 mb-4' />
          </div>
          {ReactQuill ? (
            <ReactQuill
              theme="snow"
              value={value}
              modules={modulex}
              formats={formats}
              onChange={setValue}
              placeholder="Write something..."
            />
          ) : (
            'Loading...'
          )}
          <button className='btn btn-success mt-2'>post email <Send /></button>
          <button className='btn btn-primary mt-2' style={{ marginLeft: '20px' }}><Drafts /> save as draft </button>
        </div>

      </MainSettingsLayoutView>
    </>
  );
}

