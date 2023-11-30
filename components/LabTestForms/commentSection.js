import React from 'react';
import dynamic from 'next/dynamic'
const  MARKDOWN_EDITOR = dynamic(  () => import('../../components/accessories/markdownEditor'), { ssr: false })


export default function CommentSection({ getcomment, datafunction, target, value, datasource }) {

  const updatedata = async function (event, data) {
    datafunction({ ...datasource, [target]: data });
  }

  return (
    <>
      <div
        style={{
          height: "auto",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "3px",
        }}
      >
        <h5>comments</h5>
        {/* <textarea
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
        ></textarea> */}
        <MARKDOWN_EDITOR updatedata={updatedata}  initialData={value} />
      </div>
    </>
  );
}
