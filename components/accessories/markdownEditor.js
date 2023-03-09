import React, { useState, useMemo, useRef } from 'react'
import JoditEditor from 'jodit-react'
export default function MARKDOWN_EDITOR({ placeholder }) {
  const editor = useRef(null);
  const [content, setContent] = useState('');

  const config = useMemo(() => {
    readonly: false,
      placeholder
  }, [placeholder])
  return (
    <>
      <div className='editor-subject col-7'>
        <label htmlFor='subject' className='form-label'>Subject</label>
        <input type='text' placeholder='subject' className='form-control mb-3' />
      </div>
      <div className='editor-message'>
        <JoditEditor
          ref={editor}
          value={content}
          config={config}
          tabIndex={1} // tabIndex of textarea
          onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
          onChange={newContent => {
            console.log('onChange', newContent)
          }} />
      </div>
    </>
  )
}
