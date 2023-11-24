import React, { useContext } from 'react'
import SECOND_NO_DATA from '../accessories/secondNodata';
import { PatientContext } from '../../pages/patients';
export default function BillingDatesView({ source }) {
  const { initials, updateInitials } = useContext(PatientContext);

  return (
    <>
      {source.length === 0 && <SECOND_NO_DATA />}
      {/* billing dates of client will appear here */}
      {source.length > 0 && (
        source.map((item, index) => {
          return (
            <li
              className="bg-secondary rounded text-center text-dark m-0   border-bottom cursor-pointer bg-opacity-50"
              key={index}
              onClick={(e) => {
                updateInitials({type: 'POPULATE_SELECTED',selection: item.TransactionId})
              }}
            >
              {item.TransactionsDate.slice(0,10)}
            </li>
          );
        })
      )}
    </>
  )
}
