import { AssignmentInd, House } from '@mui/icons-material'
import AppCustomLayout from '../Layout/CustomLayout'

export default function DashBoardLayoutSales({ children }) {
  const sidebarLinks = [
    { title: 'Sales', link: '/dashboard', icon: <AssignmentInd /> },
    { title: 'Organization', link: '/dashboard/organization', icon: <House /> }
  ];

  return (
    <AppCustomLayout sideLinks={sidebarLinks} defaultscreen={false}>
      {children}
  </AppCustomLayout>
  )
}
