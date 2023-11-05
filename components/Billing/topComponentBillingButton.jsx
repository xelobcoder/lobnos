import { AddOutlined, ShoppingBag } from '@mui/icons-material'
import React, { useState } from 'react'
import SnapClinicianModal from './SnapClinicianModal'
import BasicInformationClinician from '../Clinicians/BasicInformationClinician';
import BasicInfo from '../organization/BasicInfo';
import ClientOutstandingBill from './OutstandingBill';
export default function TopComponentBillingButton({ cart }) {
  const [whattoShow, setWhattoShow] = useState(null);
  const [show, setShow] = useState(false);
  const handleShow = (c) => { setShow(!show); }


  return (
    <>
      <div className='mx-2' style={{ display: 'grid', gridTemplateColumns: '60% auto', marginTop: '10px' }}>
        <ClientOutstandingBill />
        <div className='grid-30-30-30'>
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
            className="btn btn-success btn-sm"
            onClick={(e) => {
              setWhattoShow('c')
              handleShow();
            }}
          >
            <AddOutlined /> clinician
          </button>
          <button className="btn btn-primary btn-sm text-wite">
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
