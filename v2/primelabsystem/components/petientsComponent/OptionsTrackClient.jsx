/* eslint-disable react/display-name */
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Button, Box, Typography, Modal } from '@mui/material';

const style = {
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  border: '4px solid black',
  boxShadow: 24,
  // borderRadius: '10px',
  p: 4,
};

const OptionsTrackClient = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }));

  return (
    <div>
      <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Please, what do you want to track?
            </Typography>
            <Typography
              className='d-flex justify-content-between'
              id="modal-modal-description"
              sx={{ mt: 2 }}
            >
              <button className='btn btn-warning lead p-2'>
                Track this transaction test
              </button>
              <button onClick={(ev) => console.log('Tracking at all times ')} className='btn btn-primary lead p-2'>
                Track at all times
              </button>
            </Typography>
          </Box>
        </Modal>
      </div>
    </div>
  );
});

export default OptionsTrackClient;
