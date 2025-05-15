import React from 'react'
import OrganizationWrapperLayout from '../../../components/organization/OrganizationWrapperLayout'
import ContactPerson from '../../../components/organization/ContactPerson'
import { useRouter } from 'next/router'

export default function OrganizationContactperson() {
  const organizationid = useRouter().query.id;
  return (
    <OrganizationWrapperLayout>
      <ContactPerson organizationid={organizationid} />
    </OrganizationWrapperLayout>
  )
}
