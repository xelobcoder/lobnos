'use client'
import React from 'react'
import { ToastContainer } from 'react-toastify'

export default function PrimeToast() {
    return (
        <div>
            <ToastContainer theme='colored' position='top-center' className={'text-sm'} closeOnClick draggable />
        </div>
    )
}
