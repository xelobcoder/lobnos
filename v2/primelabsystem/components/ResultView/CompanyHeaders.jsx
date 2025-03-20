
export default function CompanyHeaders({ companyInfo }) {
  const { email, phonenumber, address, name, alternativenumber } = companyInfo

  return (
    <div className="company-info-result">
      <div className="logo">
        <img src={`${process.env.BASEURL}/settings/companyprofile/images`} width={150} height={100} alt="company Logo" />
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
