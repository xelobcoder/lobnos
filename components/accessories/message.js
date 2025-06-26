import React, { useState, useEffect} from 'react';


export default function Message({ props, handleView }) {
  const { message, type, show, width } = props;

  const [showx, setShowx] = useState(show);


  const typeDx = function () {
    if (!type) return;
    if (type) {
      switch (type) {
        case 'error':
          return 'alert alert-danger';
        case 'success':
          return 'alert alert-success';
        case 'info':
          return 'alert alert-info bg-info';
        case 'warning':
          return 'alert alert-warning';
        default:
          return 'alert alert-secondary'
      }
    }
  }


  useEffect(() => {
    setTimeout(() => {
      setShowx(false);
      handleView();
    }, 5000);
  }, [])



  return (
    <>
      {
        showx ?
          <div className='container'>
            <div className={`${typeDx()} p-4`} >
              {message}
            </div>
          </div>
          : null
      }
    </>
  )
}