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
          <Image src={`${process.env.BASEURL}/settings/companyprofile/images`} width={200} height={100} alt="company Logo" />
        </div>
        <div>
          <div className="company-name">{name}</div>
          <div className='company-kids'>
            {address} || {email} || {website}
          </div>
          <div className='company-kids'>
            Contact us: 0{phonenumber} || 0{alternativenumber}
          </div>
        </div>
      </div>
    </div>
  )
}
