import Image from 'next/image';
import { useEffect, useState } from "react"
import { getCompanyInformation } from "../Auth/customFetch"
import useCompanyImageUrl from "../../Auth/useCompanyImageUrl"

export default function CompanyHeaders({ billingid }) {
  const logo = useCompanyImageUrl()
  const [company, setCompany] = useState({})
  const { email, phonenumber, address, name, alternativenumber } = company

  useEffect(() => {
    try {
      billingid && getCompanyInformation(setCompany)
    } catch (err) {
      console.log('something wrong occured')
    }
  }, [billingid])

  return (
    <div className="company-info-result">
      <div className="logo">
        {logo && <img src={logo} width={150} height={100} alt="company Logo" />}
      </div>
      <div className='other-information'>
        <div className="company-name">{name}</div>
        <div className="company-kids fw-bold">Location:{address} </div>
        <div className="company-kids fw-bold">Email: {email}</div>
        <div className="company-kids text-capitalize">
          <span className="fw-bold">
            Contact us: 0{phonenumber} || 0{alternativenumber}
          </span>
        </div>
      </div>
    </div>
  )
}
