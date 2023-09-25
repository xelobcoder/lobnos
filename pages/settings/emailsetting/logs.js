import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import SettingsLayout from '../../../components/settingsComponents/SettingsLayout';
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function EMAIL_LOGS() {
  const [value, setValue] = useState('');

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': '1' }, { 'header': '2' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      // Remove 'direction' from the toolbar
      ['link', 'image', 'video', 'formula'],
      [{ 'align': [] }],
      ['clean'],
      [{ 'color': [] }],
    ],
  };
  
  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'header', 'list', 'bullet',
    'script', 'indent', 'direction',
    'link', 'image', 'video', 'formula',
    'align',
    'color',
  ];
  

  return (
    <>
      <SettingsLayout sidebar={<EmailSidebarJSX />}>
        <div className='container p-2'>
          <h1>logs</h1>
          {ReactQuill ? (
            <ReactQuill
              theme="snow"
              value={value}
              modules={modules}
              formats={formats}
              onChange={setValue}
              placeholder="Write something..."
            />
          ) : (
            'Loading...'
          )}
        </div>
      </SettingsLayout>
    </>
  );
}

