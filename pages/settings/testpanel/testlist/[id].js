import MainSettingsLayoutView from "../../../../components/settingsComponents/MainSettingsLayoutView";
import { useRouter } from "next/router";
import TestForm from "../../../../components/settingsComponents/test/testForm";
export default function SingleTestEdit() {
   const testid = useRouter().query.id;

   return (
      <MainSettingsLayoutView>
         <TestForm method="PUT" testid={testid} customtest={0} />
      </MainSettingsLayoutView>
   )
}