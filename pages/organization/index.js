import React from 'react'
import OrganizationList from '../../components/organization/List'
import OrganizationWrapperLayout from '../../components/organization/OrganizationWrapperLayout'


export default function OrganizationMainPage() {
  return (
    <OrganizationWrapperLayout>
      <OrganizationList />
    </OrganizationWrapperLayout>

  )
}
