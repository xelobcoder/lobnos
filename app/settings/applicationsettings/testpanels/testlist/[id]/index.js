import MainSettingsLayoutView from "../../../../../components/settingsComponents/MainSettingsLayoutView";
import { useRouter } from "next/router";
import TestForm from "../../../../../components/settingsComponents/test/testForm";
export default function SingleTestEdit() {
   const router = useRouter();
   const testid = router.query.id;

   return (
      <MainSettingsLayoutView>
         <TestForm method="PUT" router={router} testid={testid} customtest={0} />
      </MainSettingsLayoutView>
   )
}