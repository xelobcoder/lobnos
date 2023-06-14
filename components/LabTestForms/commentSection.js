import { Button } from '@mui/material';
import React from 'react';

export default function CommentSection({ getcomment, datafunction, target, value, datasource }) {

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
        <textarea
          className="form-control"
          value={value}
          rows={4}
          name="comment"
          style={{
            width: "99%",
            padding: "10px",
          }}
          placeholder="comments here"
          onChange={(e) => getcomment(e, datasource, target, datafunction)}
        ></textarea>
        <div className="d-flex justify-content-between mt-3 mb-2">
          <div className="form-group">
            <label>scientist name</label>
            <input
              className="custom-input"
              disabled
              placeholder="scientist name"
            />
          </div>
          <div className="form-group">
            <label>passkey</label>
            <input
              className="custom-input"
              type="password"
              placeholder="passkey"
            />
          </div>
        </div>
        <div>
          <span>
            All result would need to be authenticated by the laboratory manager
            before a print out can be executed.
            <br />
            Hence, a deleyance noticed ,kindly notify the manager.
          </span>
          <br />
        </div>
      </div>
    </>
  );
}
