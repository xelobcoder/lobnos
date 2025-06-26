import React from 'react'

interface VersionFooterProps {

}
export default function VersionFooter({}: VersionFooterProps) {
  return (
    <>
      <div className="d-flex ui text-sm  justify-content-center text-primary">
        Software by leonides intell,PLS v0.0.1 copyright @{new Date().getFullYear()}.{" "}Tell: 0249434803 || 0595964565
      </div>
    </>
  )
}