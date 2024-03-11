import VersionFooter from '../accessories/VersionFooter';
export default function CompanyFooter({ details }) {
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
      <VersionFooter />
    </>
  )
}
