import { Add } from "@mui/icons-material";
import ExpenseLayout from "../../../components/Expense/ExpenseLayout";

export default function ReceiptUploadForm() {
     return (
          <ExpenseLayout>
               <div style={{width:'30vw',height:'60vh'}} className="pointer border br-5 border-secondary-subtle bg-white">
                    <h5 className="text-center">Upload receipt here</h5>
                    <div className="d-flex justify-content-center align-items-center">
                         <Add color="" style={{fontSize:'200px'}}/>
                    </div>
               </div>
          </ExpenseLayout>
     )
}