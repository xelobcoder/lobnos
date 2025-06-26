import { useSearchParams } from "next/navigation";
import MultipleUserLogin from "../../components/Auth/multipleLogins/multipleLogins";
export default function MultipleLoginsPage() {
     const email = useSearchParams().get('email');
     return (
          <MultipleUserLogin email={email} />
     )
}


MultipleLoginsPage.getLayout = function getLayout(page) {
     return (
          <>
               {page}
          </>
     )

}