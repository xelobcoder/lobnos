import React, { useEffect, useState, useRef } from 'react'

export default function ScanPreview({ content }) {
  const contentRef = useRef();

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = content
    }
  }, [content])

  console.log(contentRef)
  return (
    <>
      <div ref={contentRef}>

      </div>
    </>
  )
}
