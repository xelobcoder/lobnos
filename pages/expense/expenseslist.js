import Authorization from '../../components/accessories/authorization';
import AuthContext from '../../components/Auth/useAuthentification';
import AdminExpensesList from '../../components/Expense/AdminExpenseListView';
import { useContext } from 'react';

export default function ExpenseListAdmin() {
     const { auth } = useContext(AuthContext);
     const { branchid, employeeid } = auth;

     const renderingView = () => {
          if (!auth.role) {
               return <div className='mt-3 text-center'>Please Wait. Loading.........</div>
          } else if (auth.role && !['admin', 'manager'].includes(auth.role)) {
               return <Authorization />
          } else {
               return <AdminExpensesList branchid={branchid} employeeid={employeeid} />
          }
     }
     return (<>{renderingView()}</>)
}


