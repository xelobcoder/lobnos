import React, { useState } from 'react'
import { useEffect } from 'react'

export default function DateTimer() {

  return (
    <>
      {new Date().toDateString()}
    </>
  )
}
