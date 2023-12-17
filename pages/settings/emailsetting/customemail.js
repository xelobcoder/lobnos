import React, { Suspense, useContext, useState } from 'react';
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar';
const MARKDOWN = React.lazy(() => import('../../../components/accessories/markdownEditor'));
import ISLOADING from '../../../components/isLoading';
import { Drafts, Subject } from '@mui/icons-material';
import { customPost } from '../../../components/Auth/customFetch';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';
import { ToastContainer,toast } from 'react-toastify';
import AuthContext from '../../../components/Auth/useAuthentification';
import { useRouter } from 'next/navigation';
export default function EMAIL_LOGS() {
  const { auth } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const employeeid = auth?.employeeid;
  const [draft, setDraft] = useState("<h1>hello world</h1>");
  const router = useRouter();
  

  const saveDraft = async () => {
    const data = { subject:  title, draft,employeeid };
    if (title.length < 3) {
      toast.error('Subject must be more than 3 characters',{autoClose:1000});
      return;
    }
    if (draft.length < 50) {
      toast.error('Draft must be more than 50 characters',{autoClose:1000});
      return;
    }
    if (!employeeid) {
      toast.error('employeeid is required',{autoClose:1000});
      return;
    }
    const pushDraft = await customPost('email/composed/draft', 'POST', data);
    const { statusCode, status, message } = pushDraft;
    if (statusCode === 200 && status === 'success') {
      toast.success(message, { autoClose: 1000 });
      setDraft('');
      setTitle('');
      setTimeout(() => {
        router.push("/settings/emailsetting/emails");
      }, 1000);
      return;
    }
    else {
      toast.error(message, { autoClose: 1000 });
      return;
    }
  }
  


  
  const updateData = (ev, data) => { setDraft(data); }
  

  
  return (
    <>
      <MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
        <ToastContainer/>
        <div className='grid mx-2'>
          <div>
            <h4 className='text-primary fw-bold'>Compose Email Here</h4>
            <div>
              <label>Subject</label>
              <input type='text' className='custom-input mb-3' placeholder='enter email subject' 
              value={title} onChange={(ev) => setTitle(ev.target.value)} />
          <Suspense fallback={<ISLOADING/>}>
                <MARKDOWN updatedata={updateData} initialData={draft} style={{height:'800px'} } />
                <button onClick={saveDraft} className='btn btn-sm btn-primary mt-2' ><Drafts /> save as draft </button>
          </Suspense>
          </div>
        </div>
         </div>
      </MainSettingsLayoutView>
    </>
  );
}

