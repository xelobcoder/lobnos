import FrontDeskLayout from "../Layout/FrontDeskLayout"

export default function OrganizationWrapperLayout({ children }) {
  return (
    <FrontDeskLayout>
      <div className="mx-1">
        {children}
      </div>
    </FrontDeskLayout>
  )
}
