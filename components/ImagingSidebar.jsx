import React from 'react'
import { useRouter } from 'next/router'
export default function ImagingSidebar() {
  const router = useRouter();

  const handleRouter = (link) => { router.push(link) }
  return (
    <>
      <ul className="mt-1">
        <button
          onClick={() => {
            handleRouter("/operations/imaging/ultrasound/waitinglist");
          }}
          className="btn btn-primary"
          style={{ borderRadius: 0 }}
        >
          client queue
        </button>
        <button
          onClick={() => {
            handleRouter("/operations/imaging/ultrasound/processedlist");
          }}
          className="btn btn-warning mx-1" style={{ borderRadius: 0 }}>
          processed scan reports
        </button>
        <button className="btn btn-danger mx-1" style={{ borderRadius: 0 }}>
          waitingList
        </button>
      </ul>
    </>
  );
}
