import React, { Suspense, useState } from 'react';
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar';
const MARKDOWN = React.lazy(() => import('../../../components/accessories/markdownEditor'));
import { Drafts, Send } from '@mui/icons-material';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';

export default function EMAIL_LOGS() {
  const [value, setValue] = useState('');


  return (
    <>
      <MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
        <div className='grid' style={{display:'grid',gridTemplateColumns:'20% auto',gridGap:'20px'}}>
        <div className='row p-2'>
            <div>
              <label>Category</label>
              <select className='custom-input mb-1'>
                <option >select category of the recipient</option>
                <option value={'clients'}>client</option>
                <option value={'staff'}>staff</option>
                <option value='bulk clients'>bulk clients</option>
                <option value='bulk staff'>bulk staff</option>
              </select>
              <br />
              <label>Recipient Email</label>
              <input multiple type='search' className='custom-input' placeholder='search for recipient email' />
            </div>
          </div>
        <div>
          <div className='form-row '>
            <label>subject</label>
              <Suspense fallback={<h1>Loading Editor</h1>}>
           <MARKDOWN />
              </Suspense>
          </div>
         
          <button className='btn btn-sm btn-success mt-2'>post email <Send /></button>
          <button className='btn btn-sm btn-primary mt-2 mx-3' ><Drafts /> save as draft </button>
        </div>
         </div>
      </MainSettingsLayoutView>
    </>
  );
}

