import { Add, Info, List, Payment, Phone } from '@mui/icons-material'
import { useRouter } from 'next/router';
import FrontDeskLayout from "../Layout/FrontDeskLayout"

export default function OrganizationWrapperLayout({ children }) {
  const router = useRouter()
  const organizationid = router.query.id
  const pushRouter = (target) => {
    router.push(target)
  }
  return (
    <FrontDeskLayout>
      <div className="mx-1">
        {organizationid && (
          <>
            <button
              disabled={!organizationid}
              className="btn btn  btn-warning mt-1 mx-1 "
              onClick={(ev) => {
                pushRouter(`/organization/${organizationid}/basicinfo`)
              }}>
              {" "}
              <Info /> basic information
            </button>
            <button
              disabled={!organizationid}
              className="btn btn  btn-warning mt-1 mx-1 "
              onClick={(ev) => {
                pushRouter(`/organization/${organizationid}/contactperson`)
              }}>
              <Phone /> contact person
            </button>
            <button
              disabled={!organizationid}
              className="btn btn  btn-warning mt-1 mx-1 "
              onClick={(ev) => {
                pushRouter(`/organization/${organizationid}/payment`)
              }}>
              <Payment /> payment modules
            </button>
          </>
        )}
        {children}
      </div>
    </FrontDeskLayout>
  )
}
