import React, { useState, useEffect, useRef, useMemo } from 'react';


export default function Message({ type, message, width, displaytime, controller }) {
 const [state, setState] = useState({ type, message, width, displaytime })
 const alertRef = useRef();
 const typefxn = function (type) {
  switch (type) {
   case 'error':
    return 'alert alert-danger border-0'
    break;
   case 'success':
    return 'alert alert-success b-0 border-radius-0 '
    break;
   case 'warning':
    return 'alert alert-warning'
    break
   default:
    return 'alert alert-secondary'
  }
 }
 useEffect(() => {
  // making alertref visible incase of multiple usage
  alertRef.current.style.display = 'block !important';
  // determine if value is a number
  const isNumber = typeof displaytime == 'number' ? true : false;
  // make message alert display none
  const show = function (time) {
   let counter = 0;
   let half = time / 2;
   for (counter; counter <= time; counter++) {
    if (counter > half) {
     setState({ ...state, type: `alert alert ${state.type} border-3` })
    }
    if (counter == time) {
     // function to control what happen next after the display time reaches
     controller()
    }
   }
  }

  return isNumber ? show(state.displaytime) : show(10000)
 }, [alertRef])

 return (
  <>
   <div className='container-fluid' ref={alertRef}>
    <div className={state.width == 'small' ? 'col-6' : 'col-12'}>
     <div className={typefxn(state.type)}>
      <h6>
       {
        state.message
       }
      </h6>
     </div>
    </div>
   </div>
  </>
 )
}