import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@mui/material';

export default function MARKDOWN_EDITOR() {
  const editorRef = useRef(null);
  const [onlinemode, setOnlinemode] = useState(true);

  return (
    <>
      {
        onlinemode ? <Editor
          apiKey='your-api-key'
          onInit={(evt, editor) => editorRef.current = editor}
          className='form-control'
          initialValue="<p>This is the initial content of the editor.</p>"
          init={{
            height: 200,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: ''
          }}
        /> : <textarea className='form-control' rows={4} placeholder='comments here'> 
        </textarea>
      }
    </>
  );
}