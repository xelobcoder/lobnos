import { useSearchParams } from 'next/navigation';
import MainSettingsLayoutView from '../../../../components/settingsComponents/MainSettingsLayoutView'
import CreateTestFields from '../../../../components/settingsComponents/FieldsCreation/createfieldsComponent';
export default function CreateSingleFieldPage() {
   const testid = useSearchParams().get("testid");
   const testname = useSearchParams().get('testname');

   return (
      <MainSettingsLayoutView>
         <CreateTestFields testname={testname} testid={testid} />
      </MainSettingsLayoutView>
   )
}