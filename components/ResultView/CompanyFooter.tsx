export default function CompanyFooter({ details }: {details?: {name?: string; address?: string; street?: string; motto?: string}}) {
  return (
    <>
      <div className="company-view-result">
        <div className="wrapper d-flex flex-column">
          <div className="line d-flex  justify-content-center">
            {details?.name} {details?.address} {details?.street}
          </div>
          <div className="line d-flex justify-content-center">{details?.motto}</div>
        </div>
      </div>
    </>
  )
}
