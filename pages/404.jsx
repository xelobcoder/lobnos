import React from 'react'
import Header from '../components/header'

export default function NotFound() {
  return (
    <div>
      <header className='d-flex justify-content-center mt-4'>
        <h1 className='lims-text-color'>PAGE NOT FOUND</h1>
      </header>
      <header className="d-flex justify-content-center mt-4">
        <h1>404</h1>
      </header>
    </div>
  )
}



NotFound.getLayout = function getLayout(page) {
  return (
    <>
      <Header />
      {page}
    </>
  )
}