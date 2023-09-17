import Image from 'next/image'
import React from 'react'
import { useContext } from 'react';
import { PatientContext } from '../../pages/patients';

export default function NotSelected({ message }) {
  const { initials } = useContext(PatientContext);
  const { datesSource } = initials;
  return (
    <>
      {
        datesSource.length > 0 ? (
          <div className="bg-white p-2 d-flex  flex-column br-7 justify-content-center align-items-center">
            <Image
              src={"/asserts/ill-nodata.jpg"}
              height={200}
              property="prority"
              style={{ backgroundColor: "transparent" }}
              alt="No transaction date selected"
              width={300}
            />
            <span className="bg-warning p-3 lead rounded pointer text-primary">
              {message}
            </span>
          </div>
        ) : (
          <div className='p-3 bg-white text-primary br-5'>
            <h6>
              Search with a valid client unique identity number to continue
            </h6>
          </div>
        )
      }
    </>
  );
}
