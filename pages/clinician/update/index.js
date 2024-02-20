import BasicInformationClinician from '../../../components/Clinicians/BasicInformationClinician'
import FrontDeskLayout from '../../../components/Layout/FrontDeskLayout'
export default function ClinicianUpdateForm() {

  return (
    <FrontDeskLayout>
      <div className='card mx-2 my-2'>
            <div className='card-header bg-secondary text-white'>
              <h4>Update Basic information</h4>
            </div>
            <div className='card-body'>
            <BasicInformationClinician />
            </div>
        </div>
    </FrontDeskLayout>
  )
}
