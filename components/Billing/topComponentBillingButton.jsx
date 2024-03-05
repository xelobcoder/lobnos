import { AddOutlined, ShoppingBag } from '@mui/icons-material'
import React, { useState } from 'react'
import SnapClinicianModal from './SnapClinicianModal'
import BasicInformationClinician from '../Clinicians/BasicInformationClinician';
import BasicInfo from '../organization/BasicInfo';
export default function TopComponentBillingButton({ cart}) {
  const [whattoShow, setWhattoShow] = useState(null);
  const [show, setShow] = useState(false);
  const handleShow = (c) => { setShow(!show); }


  return (
    <>
      <div className='mx-1 my-1'>
        <div className='d-flex justify-content-end'>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={(e) => {
              setWhattoShow('o')
              handleShow();
            }}
          >
            organization
          </button>
          <button
            className="btn btn-outline-secondary btn-sm mx-2"
            onClick={(e) => {
              setWhattoShow('c')
              handleShow();
            }}
          >
          clinician
          </button>
        </div>
      </div>
      <SnapClinicianModal
        show={show}
        close={handleShow}
        title={whattoShow == 'c' ? "create new clinician" : 'create new organization'}>
        {whattoShow == "c" && <BasicInformationClinician />}
        {whattoShow == 'o' && <BasicInfo  titleshow={false}/>}
      </SnapClinicianModal>
    </>
  );
}
