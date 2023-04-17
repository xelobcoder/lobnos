import React from 'react';
import MARKDOWN_EDITOR from '../accessories/markdownEditor';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';

export default function CommentSection() {

  return (
    <>
      <div style={{ height: 'auto', overflowY: 'auto' }}>
        <h5>comments</h5>
        <MARKDOWN_EDITOR />
        <div className="d-flex justify-content-between mt-3 mb-2">
          <div className="form-group">
            <label>scientist name</label>
            <input className="custom-input" placeholder="scientist name" />
          </div>
          <div className="form-group">
            <label>passkey</label>
            <input className="custom-input" placeholder="passkey" />
          </div>
        </div>
        <div>
          <span>
            All result would need to be authenticated by the laboratory manager before a print out can be executed.
            Hence, a deleyance noticed ,kindly notify the manager.
          </span>
          <br />
          <Button className="btn btn-primary mt-4 mb-5" variant='contained'
            color='primary'>
            save result
          </Button>
        </div>
      </div>
    </>
  )
}
