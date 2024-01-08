import React, { useState, useContext, useEffect } from 'react';
import { Menu, Close } from '@mui/icons-material';



export default function SettingsLayout({ children, sidebar }) {
  const [close, setClose] = useState(false);

  const handleShow = () => {
    const sidebar = document.querySelector('.settings-sidebar');
    if (!sidebar.style.display || sidebar.style.display == 'none') {
      sidebar.style.display = 'block';
      setClose(true);
    } else {
      sidebar.style.display = 'none';
      setClose(false)
    }
  }

  return (
    <>
      <div>
        <div className='wrapper'>
          <div className='side'>
            <div className='sidebarMenu'>
              {!close ? <Menu onClick={(ev) => handleShow()} className='pointer' fontSize='large' /> :
                <Close className='pointer' fontSize='large' onClick={(ev) => handleShow()} />}
            </div>
            {sidebar}
          </div>
          <div className='main'>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
