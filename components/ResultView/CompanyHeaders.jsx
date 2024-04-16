import Image from 'next/image';
import { useEffect, useState } from "react"
import { getCompanyInformation } from "../Auth/customFetch"

export default function CompanyHeaders({ billingid }) {
  const [company, setCompany] = useState({})
  const { email, phonenumber, website, address, name, alternativenumber } = company

  useEffect(() => {
    try {
      billingid && getCompanyInformation(setCompany)
    } catch (err) {
      console.log(err)
    }
  }, [billingid])

  return (
    <div>
      <div className="company-logo">
        <div className="logo">
          <Image src={`${process.env.BASEURL}/settings/companyprofile/images`} width={200} height={150} alt="company Logo" />
        </div>
        <div>
          <div className="company-name">{name}</div>
          <div className="company-kids text-capitalize fw-bold">Location:{address} </div>
          <div className="company-kids text-capitalize fw-bold">Email: {email}</div>
          <div className="company-kids text-capitalize">
            <span className="fw-bold">
              Contact us: 0{phonenumber} || 0{alternativenumber}
            </span>
          </div>
          <div className="company-kids text-capitalize">Website: {website}</div>
        </div>
      </div>
    </div>
  )
}
