import React from 'react'
import PatientFiltered from './CustomerFiltering';
import OutsourceOrganizationFiltering from './OutsourceOrganizationFiltering';
import OrganizationFiltering from './OrganizationFiltering';
import ClinicianFiltering from './ClinicianFiltering';
import StaffsFiltering from './StaffFiltering';
import { SmsCategoryType } from '../../sms/SmsInterfaces';

export default function SmsCategoryFiltering({ selectedCategory, onSelect }: {
     selectedCategory: SmsCategoryType,
     onSelect: (value: any) => void
}) {
     const rendering = () => {
          const { categorization, isBulk, value } = selectedCategory;
          if (isBulk) return null;
          if (value == "clients") return <PatientFiltered getSelectedPatient={onSelect} isDisabled={false} />
          else if (value === "outsourcing") return <OutsourceOrganizationFiltering onSelect={onSelect} />
          else if (value == "organization") return <OrganizationFiltering onSelect={onSelect} />
          else if (value == "clinicians") return <ClinicianFiltering onSelect={onSelect} />
          else if (value == "staffs") return <StaffsFiltering onSelect={onSelect} />
          else {
               return null;
          }
     }
     return (
          <div>
               {rendering()}
          </div>
     )
}
