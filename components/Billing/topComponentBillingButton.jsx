import { AddOutlined, ShoppingBag } from '@mui/icons-material'
import React, { useState } from 'react'
import SnapClinicianModal from './SnapClinicianModal'
import BasicInformationClinician from '../Clinicians/BasicInformationClinician';
import BasicInfo from '../organization/BasicInfo';
export default function TopComponentBillingButton({ cart,toggleTax ,includeTax}) {
  const [whattoShow, setWhattoShow] = useState(null);
  const [show, setShow] = useState(false);
  const handleShow = (c) => { setShow(!show); }


  return (
    <>
      <div className='mx-1 my-1'>
        <div className='d-flex justify-content-end'>
          <button onClick={(ev) => {toggleTax()}} className='btn btn-success btn-sm mx-1'>
          {includeTax ? 'exclude tax' : 'include tax'}
          </button>
          <button
            className="btn btn-success btn-sm"
            onClick={(e) => {
              setWhattoShow('o')
              handleShow();
            }}
          >
            <AddOutlined /> organization
          </button>
          <button
            className="btn btn-success btn-sm mx-2"
            onClick={(e) => {
              setWhattoShow('c')
              handleShow();
            }}
          >
            <AddOutlined /> clinician
          </button>
          <button className="btn btn-primary btn-sm text-wite mx-2">
            <h5>cart <ShoppingBag /> {cart} </h5>
          </button>
        </div>
      </div>
      <SnapClinicianModal
        show={show}
        close={handleShow}
        title={whattoShow == 'c' ? "create new clinician" : 'create new organization'}
      >
        {whattoShow == "c" && <BasicInformationClinician />}
        {whattoShow == 'o' && <BasicInfo  titleshow={false}/>}
      </SnapClinicianModal>
    </>
  );
}
