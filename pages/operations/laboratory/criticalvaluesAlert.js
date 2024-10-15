import { useContext } from "react";
import AuthContext, { useTheme } from "../../../components/Auth/useAuthentification";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";

export default function CriticalValuesAlert() {
       const { auth } = useContext(AuthContext);
       console.log(auth)
       return (
              <LaboratoryLayout>
                     <h1>Critical Values Alert {auth?.username}</h1>
              </LaboratoryLayout>
       )
}

