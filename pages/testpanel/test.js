import HEPATITISBPROFILE from "../../components/LabTestForms/hepatitisBprofile";
import Urinalysis from "../../components/LabTestForms/urinalysis";
import LiverPanel from "../../components/setup/biochemistry/liver";
import BloodGroupTableList from "../../components/TESTTABLES/bloodgroup";

export default function AllTest () {
 return (
  <>
   <div className="alert alert-warning m-3" style={{fontSize:'14px'}}>
     please fill all the input fields with the correct data
   </div>
   <div>
    <LiverPanel/>
   </div>
  </>
 )
}


