import React from 'react'
import { Alert, AlertTitle } from '@mui/material';
export default function TopMessage({ message, type, display, messageTimer }) {
  const [show, setShow] = React.useState(display);
  const [messagetype, setType] = React.useState(type);
  const [messagecontent, setMessage] = React.useState(message);


  React.useEffect(() => {
    messageTimer();
    // rempve settimeout
  });

  return (
    <div className='dialog-message'>
      {
        show ? (
          <Alert severity={type}>
            <AlertTitle>{type}</AlertTitle>
            {message} <strong>check it out!</strong>
          </Alert>
        ) : null
      }
    </div>
  )
}
