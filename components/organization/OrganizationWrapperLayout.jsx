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
        {children}
      </div>
    </FrontDeskLayout>
  )
}
