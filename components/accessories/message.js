import React, { useState, useEffect, useRef, useMemo } from 'react';


export default function Message({ props,handleView}) {
  const { message, type, displaytime, show, width } = props;

  const [showx, setShowx] = useState(show);


  const typeDx = function () {
    if (!type) return;
    if (type) {
      switch (type) {
        case 'error':
          return 'alert alert-danger';
          break;
        case 'success':
          return 'alert alert-success';
          break;
        case 'info':
          return 'alert alert-info';
          break;
        case 'warning':
          return 'alert alert-warning';
          break;
        default:
          return 'alert alert-secondary'
      }
    }
  }


  useEffect(() => {
    setTimeout(() => {
      setShowx(false);
      handleView();
    }, displaytime);
  }, [displaytime])



  return (
    <>
      {
        showx ?
          <div className='container'>
            <div className={typeDx()}>
              {message}
            </div>
          </div>
          : null
      }
    </>
  )
}