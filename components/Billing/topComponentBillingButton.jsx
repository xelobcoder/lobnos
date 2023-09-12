import { Shop2Outlined, ShoppingBag } from '@mui/icons-material'
import React, { useState } from 'react'
import SnapClinicianModal from './SnapClinicianModal'
import BasicInformationClinician from '../Clinicians/BasicInformationClinician';

export default function TopComponentBillingButton({ cart }) {
  const [whattoShow, setWhattoShow] = useState(null);
  const [show, setShow] = useState(false);
  const handleShow = (c) => { setShow(!show); }


  return (
    <>
      <SnapClinicianModal
        show={show}
        close={handleShow}
        component={whattoShow == "c" && <BasicInformationClinician />}
        title={"add new clinician"}
      />
      <div className="container  d-flex justify-content-end mt-2 gap-2">
        <button
          className="btn btn-success"
          onClick={(e) => {
            setWhattoShow('o')
            handleShow();
          }}
        >
          snap organization
        </button>
        <button
          className="btn btn-success"
          onClick={(e) => {
            setWhattoShow('c')
            handleShow();
          }}
        >
          snap clinician
        </button>
        <button className="btn btn-light text-primary">
          cart <ShoppingBag />
          <span className="badge primary">{cart} </span>
        </button>
      </div>
    </>
  );
}
