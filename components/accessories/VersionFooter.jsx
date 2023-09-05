import React from 'react'
import Link from 'next/link'
export default function VersionFooter() {
  return (
    <>
      <h6 className='d-flex justify-content-center text-primary'>
        Software by leonides intell,version 0.0.1 copyright @{new Date().getFullYear()}.
        <span>Tel {">>"}</span>
        0249434803
      </h6>
    </>
  )
}
