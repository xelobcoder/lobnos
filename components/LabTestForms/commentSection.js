import React, { useState } from 'react';
import dynamic from 'next/dynamic'
import { Form } from 'react-bootstrap'
const MARKDOWN_EDITOR = dynamic(() => import('../../components/accessories/markdownEditor'), { ssr: false })


export default function CommentSection({ getcomment, datafunction, target, value, datasource }) {
  const [advanceEditor, setAdvanceEditor] = useState(true);

  const updatedata = async function (event, data) {
    datafunction({ ...datasource, [target]: data });
  }

  return (
    <>
      <div
        style={{ height: "auto", overflowY: "auto", overflowX: "hidden", padding: "3px" }}
      >
        <div className='d-flex justify-content-between'>
          <h5>comments</h5>
          <div className='d-flex'>
            <Form.Switch checked={advanceEditor} onChange={() => { setAdvanceEditor(!advanceEditor) }} />
            <h6>Use advance editor</h6>
          </div>
        </div>

        {advanceEditor ?
          <MARKDOWN_EDITOR updatedata={updatedata} initialData={value} />
          :
          (<textarea
            className="form-control mb-2"
            value={value}
            rows={4}
            name="comment"
            style={{
              width: "99%",
              padding: "10px",
            }}
            placeholder="comments here"
            onChange={(e) => getcomment(e, datasource, target, datafunction)}
          ></textarea>)}
      </div>
    </>
  );
}
