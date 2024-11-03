import Authorization from '../../components/accessories/authorization';
import { useApplicationSettings } from '../../components/Auth/useApplicationContext';
import AdminExpensesList from '../../components/Expense/AdminExpenseListView';


export default function ExpenseListAdmin() {
     const { applicationsettings } = useApplicationSettings();
     const { user, branchid } = applicationsettings;
     const { employeeid, username, role } = user;

     if (!employeeid) return null



     const renderingView = () => {
          if (!role) {
               return <div className='mt-3 text-center'>Please Wait. Loading.........</div>
          } else if (role && !['admin', 'manager'].includes(role)) {
               return <Authorization />
          } else {
               return <AdminExpensesList branchid={branchid} employeeid={employeeid} />
          }
     }
     return (<>{renderingView()}</>)
}


