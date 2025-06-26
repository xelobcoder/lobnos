interface CompanyHeadersProps {
  companyInfo: {
    email: string;
    phonenumber: number;
    address: string;
    name: string;
    alternativenumber?: string;
  } | null;
  logo:string
}

export default function CompanyHeaders({ companyInfo,logo }: CompanyHeadersProps) {
  if (!companyInfo) return null;

  const {
    name,
    email,
    phonenumber,
    address,
    alternativenumber
  } = companyInfo;

  return (
    <div className="company-info-result">
      <div className="logo">
        <img
          src={logo || ''}
          width={150}
          height={100}
          alt="Company Logo"
        />
      </div>
      <div className="other-information">
        <div className="company-name">{name}</div>
        <div className="company-kids fw-bold">Location: {address}</div>
        <div className="company-kids fw-bold">Email: {email}</div>
        <div className="company-kids text-capitalize">
          <span className="fw-bold">
            Contact us: 0{phonenumber} || 0{alternativenumber}
          </span>
        </div>
      </div>
    </div>
  );
}
