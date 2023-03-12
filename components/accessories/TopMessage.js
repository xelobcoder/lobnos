import React from 'react'

export default function TopMessage({ message, type, display,messageTimer }) {
 const [show, setShow] = React.useState(display);
 const [messagetype, setType] = React.useState(type);
 const [messagecontent, setMessage] = React.useState(message);


 React.useEffect(() => {
  messageTimer();
  // rempve settimeout
 }, [show]);

 return (
  <div className='dialog-message'>
   {
    show ? (
     <div className={`message-box-alert-${type}`} role='alert'>
      <strong>{messagecontent}</strong>
     </div>
    ) : null
   }
  </div>
 )
}
